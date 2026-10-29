"""Quantifies how far each preprocessing variant drifts from the Ultralytics reference, using YOUR onnx.

    python ml/simulate_phone_pipeline.py --onnx mobile/assets/model/detector.onnx --images <folder>

Variants (all decoded with the same NMS so ONLY preprocessing differs):
  ref_rect    cv2 INTER_LINEAR letterbox, pad only to a multiple of 32  (= Ultralytics PyTorch predict, auto=True) <- REFERENCE
  ref_square  same but padded to a full 640x640 square                  (= Ultralytics ONNX predict)
  app_2stage  what the phone does: platform resize to 1280 wide (JPEG q100) -> rect letterbox resize (JPEG q100)
  app_alias   same but with a non-antialiased resizer (worst case for a platform bilinear scaler)
  stretch     the notebook's "mobile" emulation (aspect ratio destroyed)
"""
import argparse, io, math, pathlib, sys, time
import cv2, numpy as np, onnxruntime as ort
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "backend"))
from app.services.detector import decode_yolov8, Letterbox

RND = lambda x: int(math.floor(x + 0.5))


def jpeg_rt(rgb, q):
    b = io.BytesIO(); Image.fromarray(rgb).save(b, "JPEG", quality=q, subsampling=2 if q < 95 else 0); b.seek(0)
    return np.asarray(Image.open(b).convert("RGB"))


def letterbox(rgb, size=640, auto=False, interp=cv2.INTER_LINEAR):
    h, w = rgb.shape[:2]; r = min(size / h, size / w)
    nw, nh = RND(w * r), RND(h * r)
    dw, dh = size - nw, size - nh
    if auto: dw, dh = dw % 32, dh % 32
    dw, dh = dw / 2, dh / 2
    img = cv2.resize(rgb, (nw, nh), interpolation=interp) if (nw, nh) != (w, h) else rgb
    top, bottom, left, right = RND(dh - 0.1), RND(dh + 0.1), RND(dw - 0.1), RND(dw + 0.1)
    img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))
    lb = Letterbox(size, w, h, nw / w, nh / h, left, top, nw, nh)
    return img, lb


def run(sess, img, lb, conf, iou, nc):
    t = np.ascontiguousarray(img.astype(np.float32).transpose(2, 0, 1)[None] / 255.0)
    out = sess.run(None, {sess.get_inputs()[0].name: t})[0]
    return decode_yolov8(out, nc, lb, conf, iou, agnostic_iou=2.0)  # 2.0 = cross-class merge off (like Ultralytics)


def prep(variant, rgb):
    if variant == "ref_square": return letterbox(rgb)
    if variant == "ref_rect": return letterbox(rgb, auto=True)
    if variant in ("app_2stage", "app_alias"):
        interp = cv2.INTER_AREA if variant == "app_2stage" else cv2.INTER_LINEAR  # AREA ~ antialiased platform scaler
        h, w = rgb.shape[:2]; s = 1280 / w  # step 1: width->1280 (what the app does)
        s1 = jpeg_rt(cv2.resize(rgb, (1280, RND(h * s)), interpolation=interp), 100)
        img, lb = letterbox(s1, auto=True, interp=interp)
        return _pad_after_jpeg(img, lb), lb
    if variant == "stretch":
        h, w = rgb.shape[:2]
        return cv2.resize(rgb, (640, 640), interpolation=cv2.INTER_LINEAR), Letterbox(640, w, h, 640 / w, 640 / h, 0, 0, 640, 640)


def _pad_after_jpeg(img, lb):  # emulate: content is JPEG round-tripped (q100) THEN padded in the tensor
    c = img[lb.pad_y:lb.pad_y + lb.new_h, lb.pad_x:lb.pad_x + lb.new_w]
    out = np.full_like(img, 114); out[lb.pad_y:lb.pad_y + lb.new_h, lb.pad_x:lb.pad_x + lb.new_w] = jpeg_rt(c, 100); return out


def iou(a, b):
    ax2, ay2, bx2, by2 = a[0] + a[2], a[1] + a[3], b[0] + b[2], b[1] + b[3]
    i = max(0, min(ax2, bx2) - max(a[0], b[0])) * max(0, min(ay2, by2) - max(a[1], b[1])); u = a[2] * a[3] + b[2] * b[3] - i
    return i / u if u else 0


def compare(ref, got):
    """Match every reference box to the best IoU candidate in `got`."""
    ious, cls = [], []
    for r in ref:
        best = max(got, key=lambda g: iou(r["bbox"], g["bbox"]), default=None)
        ious.append(iou(r["bbox"], best["bbox"]) if best else 0.0)
        cls.append(best is not None and ious[-1] >= 0.5 and best["class_id"] == r["class_id"])
    return ious, cls


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--onnx", required=True); ap.add_argument("--images", required=True)
    ap.add_argument("--conf", type=float, default=0.35); ap.add_argument("--iou", type=float, default=0.45)
    a = ap.parse_args()
    sess = ort.InferenceSession(a.onnx, providers=["CPUExecutionProvider"]); nc = sess.get_outputs()[0].shape[1] - 4
    files = sorted(p for p in pathlib.Path(a.images).glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png"))
    variants = ["ref_square", "app_2stage", "app_alias", "stretch"]
    stats = {v: {"n_eq": 0, "ious": [], "cls": [], "t": []} for v in variants}; refs = 0
    print(f"{'image':<26}{'ref_rect':>9}" + "".join(f"{v:>13}" for v in variants) + "   (detections)")
    for f in files:
        rgb = np.asarray(Image.open(f).convert("RGB"))
        ref = run(sess, *prep("ref_rect", rgb), a.conf, a.iou, nc); refs += len(ref); row = f"{f.name[:25]:<26}{len(ref):>9}"
        for v in variants:
            t = time.perf_counter(); got = run(sess, *prep(v, rgb), a.conf, a.iou, nc); dt = time.perf_counter() - t
            ious, cls = compare(ref, got); s = stats[v]
            s["n_eq"] += int(len(got) == len(ref)); s["ious"] += ious; s["cls"] += cls; s["t"].append(dt); row += f"{len(got):>13}"
        print(row)
    print(f"\nAgainst ref_rect (Ultralytics PyTorch-predict equivalent) on {len(files)} images / {refs} reference boxes:")
    print(f"{'variant':<12}{'same count':>11}{'boxes IoU>=.5':>15}{'mean IoU':>10}{'class agree':>13}{'avg ms':>9}")
    for v in variants:
        s = stats[v]; n = max(1, len(s["ious"]))
        print(f"{v:<12}{s['n_eq']/len(files):>11.0%}{sum(i >= .5 for i in s['ious'])/n:>15.1%}{np.mean(s['ious']) if s['ious'] else 0:>10.3f}{sum(s['cls'])/n:>13.1%}{1000*np.mean(s['t']):>9.0f}")


if __name__ == "__main__":
    main()
