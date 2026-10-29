"""REFERENCE implementation of the on-device pipeline. NOT used to serve detections - the phone does all
inference. Used for: validating uploaded models (names/labels), parity tests and golden vectors.

The letterbox + decode logic here is mirrored 1:1 by mobile/src/ml/{preprocess,postprocess}.ts
and cross-checked by shared/golden/postprocess_golden.json.
"""
import ast
import json
import math
import threading
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from .catalog import get_item, normalize_key

PAD_VALUE = 114
_round = lambda x: int(math.floor(x + 0.5))  # JS Math.round semantics


@dataclass
class Letterbox:
    size: int
    orig_w: int
    orig_h: int
    sx: float
    sy: float
    pad_x: int
    pad_y: int
    new_w: int
    new_h: int
    canvas_w: int = 0
    canvas_h: int = 0


def make_letterbox(orig_w: int, orig_h: int, size: int = 640, dec_w: int | None = None, dec_h: int | None = None,
                   auto: bool = True, stride: int = 32) -> Letterbox:
    """Ultralytics LetterBox geometry. auto=True (PyTorch predict / val) pads only up to a multiple of `stride`
    -> rectangular tensor (e.g. 640x480). auto=False -> full size x size square."""
    r = min(size / orig_w, size / orig_h)
    new_w = dec_w if dec_w is not None else max(1, _round(orig_w * r))
    new_h = dec_h if dec_h is not None else max(1, _round(orig_h * r))
    dw, dh = size - new_w, size - new_h
    if auto:
        dw, dh = dw % stride, dh % stride
    dw, dh = dw / 2, dh / 2
    left, right, top, bottom = _round(dw - 0.1), _round(dw + 0.1), _round(dh - 0.1), _round(dh + 0.1)
    return Letterbox(size, orig_w, orig_h, new_w / orig_w, new_h / orig_h, left, top, new_w, new_h,
                     new_w + left + right, new_h + top + bottom)


def preprocess(img: Image.Image, size: int = 640, auto: bool = True) -> tuple[np.ndarray, Letterbox]:
    img = ImageOps.exif_transpose(img).convert("RGB")
    lb = make_letterbox(img.width, img.height, size, auto=auto)
    resized = img.resize((lb.new_w, lb.new_h), Image.BILINEAR)
    canvas = np.full((lb.canvas_h, lb.canvas_w, 3), PAD_VALUE, dtype=np.uint8)
    canvas[lb.pad_y:lb.pad_y + lb.new_h, lb.pad_x:lb.pad_x + lb.new_w] = np.asarray(resized)
    tensor = canvas.astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    return np.ascontiguousarray(tensor), lb


def _iou(a, b) -> float:
    ix = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union > 0 else 0.0


def decode_yolov8(out: np.ndarray, nc: int, lb: Letterbox, conf: float = 0.35, iou: float = 0.45,
                  agnostic_iou: float = 0.85, max_det: int = 100, top_alt: int = 3) -> list[dict]:
    """out: [1, 4+nc, N] (Ultralytics ONNX) or [1, N, 4+nc]. Scores are already sigmoid'ed. Returns normalised boxes."""
    a = np.asarray(out, dtype=np.float64)
    a = a[0] if a.ndim == 3 else a
    C = nc + 4
    if a.shape[0] == C:
        a = a.T
    elif a.shape[1] != C:
        raise ValueError(f"Unexpected output shape {out.shape} for nc={nc}")
    scores_all = a[:, 4:]
    best = scores_all.max(axis=1)
    cls = scores_all.argmax(axis=1)  # first max wins, same as TS loop
    idx = np.where(best >= conf)[0]
    cands = [(int(i), int(cls[i]), float(best[i])) for i in idx]
    cands.sort(key=lambda c: (-c[2], c[0]))

    def xyxy(i):
        cx, cy, w, h = a[i, 0], a[i, 1], a[i, 2], a[i, 3]
        return (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)

    # pass 1: class-aware NMS
    kept = []
    for i, c, s in cands:
        b = xyxy(i)
        if any(c == kc and _iou(b, kb) > iou for _, kc, _, kb in kept):
            continue
        kept.append((i, c, s, b))

    # pass 2: merge cross-class near-duplicates -> alternatives for the correction dropdown
    final = []  # [anchor, cls, score, box, {cls: score}]
    for i, c, s, b in kept:
        host = next((f for f in final if _iou(b, f[3]) > agnostic_iou), None)
        if host is not None:
            host[4][c] = max(host[4].get(c, 0.0), s)
        else:
            final.append([i, c, s, b, {}])
    final = final[:max_det]

    dets = []
    for i, c, s, (x1, y1, x2, y2), merged in final:
        alts = dict(merged)
        row = scores_all[i]
        for k in np.argsort(-row, kind="stable")[: top_alt + 1]:
            k = int(k)
            if k != c:
                alts[k] = max(alts.get(k, 0.0), float(row[k]))
        alts.pop(c, None)
        alt_list = sorted(alts.items(), key=lambda kv: (-kv[1], kv[0]))[:top_alt]
        ox1 = min(max((x1 - lb.pad_x) / lb.sx, 0.0), lb.orig_w)
        oy1 = min(max((y1 - lb.pad_y) / lb.sy, 0.0), lb.orig_h)
        ox2 = min(max((x2 - lb.pad_x) / lb.sx, 0.0), lb.orig_w)
        oy2 = min(max((y2 - lb.pad_y) / lb.sy, 0.0), lb.orig_h)
        dets.append({
            "class_id": c, "score": s,
            "bbox": [ox1 / lb.orig_w, oy1 / lb.orig_h, (ox2 - ox1) / lb.orig_w, (oy2 - oy1) / lb.orig_h],
            "alternatives": [{"class_id": k, "score": v} for k, v in alt_list],
        })
    return dets


class DetectorService:
    def __init__(self) -> None:
        self.session = None
        self.names: list[str] = []
        self.size = 640
        self.version = "unloaded"
        self.path: Path | None = None
        self._lock = threading.Lock()

    @property
    def ready(self) -> bool:
        return self.session is not None

    def load(self, path: str | Path, version: str | None = None) -> None:
        import onnxruntime as ort
        path = Path(path)
        sess = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
        meta = sess.get_modelmeta().custom_metadata_map or {}
        names: list[str] = []
        if "names" in meta:  # Ultralytics stores "{0: 'Apple', 1: 'Banana', ...}"
            d = ast.literal_eval(meta["names"])
            names = [d[i] for i in sorted(d)]
        else:
            labels = path.with_name("labels.json")
            if labels.exists():
                names = json.loads(labels.read_text())["names"]
        if not names:
            raise RuntimeError("Model has no class names (metadata or labels.json)")
        shape = sess.get_inputs()[0].shape
        with self._lock:
            self.session, self.names, self.path = sess, names, path
            self.size = int(shape[2]) if isinstance(shape[2], int) else 640
            self.version = version or path.stem

    def detect(self, image: Image.Image, conf: float, iou: float) -> dict:
        if not self.ready:
            raise RuntimeError("Server detector not loaded")
        t0 = time.perf_counter()
        tensor, lb = preprocess(image, self.size)
        t1 = time.perf_counter()
        with self._lock:
            out = self.session.run(None, {self.session.get_inputs()[0].name: tensor})[0]
        t2 = time.perf_counter()
        dets = decode_yolov8(out, len(self.names), lb, conf, iou)
        t3 = time.perf_counter()
        for d in dets:
            d["class_key"] = normalize_key(self.names[d["class_id"]])
            d["label"] = get_item(d["class_key"])["display"]
            for alt in d["alternatives"]:
                alt["class_key"] = normalize_key(self.names[alt["class_id"]])
                alt["label"] = get_item(alt["class_key"])["display"]
        return {
            "detections": dets, "detector_version": self.version, "image": {"width": lb.orig_w, "height": lb.orig_h},
            "latency_ms": round((t3 - t0) * 1000, 1),
            "timings": {"preprocess": round((t1 - t0) * 1000, 1), "inference": round((t2 - t1) * 1000, 1), "postprocess": round((t3 - t2) * 1000, 1)},
        }


detector = DetectorService()
