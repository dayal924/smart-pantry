"""Generate shared/golden/postprocess_golden.json from the Python reference decoder.
mobile/scripts/golden-test.ts replays the same inputs through the TypeScript decoder and must match."""
import json, pathlib, sys
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.services.detector import decode_yolov8, make_letterbox
sys.path.insert(0, str(ROOT / 'ml'))
import simulate_phone_pipeline as S   # cv2 replica of Ultralytics LetterBox

rng = np.random.default_rng(7)
cases = []
for (ow, oh, nc, n) in [(1280, 960, 6, 300), (720, 1280, 9, 500), (640, 640, 4, 120)]:
    lb = make_letterbox(ow, oh, 640)
    out = rng.random((1, 4 + nc, n)).astype(np.float32) * 0.15          # background noise below conf
    out[0, :2] = rng.uniform(80, 560, size=(2, n)); out[0, 2:4] = rng.uniform(30, 160, size=(2, n))
    # plant clusters of overlapping anchors incl. cross-class near-duplicates
    for g in range(8):
        base = rng.uniform(100, 540, 2); size = rng.uniform(60, 140, 2); c = int(rng.integers(nc))
        for j in range(4):
            i = g * 12 + j
            out[0, 0, i], out[0, 1, i] = base + rng.normal(0, 2, 2); out[0, 2, i], out[0, 3, i] = size + rng.normal(0, 2, 2)
            out[0, 4:, i] = rng.random(nc) * 0.1
            out[0, 4 + c, i] = 0.95 - 0.07 * j - 0.01 * g
            if j == 3: out[0, 4 + (c + 1) % nc, i] = 0.5       # cross-class duplicate -> alternative
    out = np.round(out.astype(np.float64), 6).astype(np.float32)   # exactly representable from the JSON decimals
    dets = decode_yolov8(out, nc, lb, conf=0.35, iou=0.45)
    cases.append({"origW": ow, "origH": oh, "nc": nc, "n": n, "conf": 0.35, "iou": 0.45,
                  "layout": [1, 4 + nc, n], "data": [round(float(v), 6) for v in out.flatten()],
                  "expected": dets})
# geometry: our letterbox must equal the Ultralytics-style cv2 replica for many photo shapes
geo = []
for (w, h) in [(4032, 3024), (3024, 4032), (1280, 960), (960, 1280), (1920, 1080), (1080, 1920), (1500, 1000), (1000, 1500), (640, 640), (512, 480), (3000, 2000), (2400, 1350), (777, 1031), (4000, 3000), (1600, 1200), (1200, 1600)]:
    img, ref = S.letterbox(np.zeros((h, w, 3), np.uint8), auto=True)
    ours = make_letterbox(w, h, 640, auto=True)
    assert (ours.new_w, ours.new_h, ours.pad_x, ours.pad_y, ours.canvas_w, ours.canvas_h) == (ref.new_w, ref.new_h, ref.pad_x, ref.pad_y, img.shape[1], img.shape[0]), (w, h)
    geo.append({"w": w, "h": h, "newW": ours.new_w, "newH": ours.new_h, "padX": ours.pad_x, "padY": ours.pad_y, "canvasW": img.shape[1], "canvasH": img.shape[0]})
p = ROOT / "shared" / "golden" / "postprocess_golden.json"
p.write_text(json.dumps({"decode": cases, "geometry": geo})); print("wrote", p, [len(c["expected"]) for c in cases], "detections per case;", len(geo), "geometry cases (python == cv2 replica)")
