"""Create the on-device self-test: 3 photos + the reference detections computed from YOUR onnx with the
Ultralytics-equivalent pipeline (cv2 rect letterbox). The app re-runs the photos through the PHONE pipeline
(Settings -> Detection self-test) and reports whether it reproduces them.

    python ml/make_selftest.py --onnx mobile/assets/model/detector.onnx --images a.jpg b.jpg c.jpg
Use 3 real photos from your dataset's valid/ folder for the strictest, in-domain check (default threshold 90%).
"""
import argparse, json, pathlib, shutil, sys
import numpy as np, onnxruntime as ort
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ml")); sys.path.insert(0, str(ROOT / "backend"))
import simulate_phone_pipeline as S
from app.services.detector import decode_yolov8

ap = argparse.ArgumentParser(); ap.add_argument("--onnx", default=str(ROOT / "mobile/assets/model/detector.onnx"))
ap.add_argument("--images", nargs="+", required=True); ap.add_argument("--min-match", type=float, default=0.9)
a = ap.parse_args()
sess = ort.InferenceSession(a.onnx, providers=["CPUExecutionProvider"]); nc = sess.get_outputs()[0].shape[1] - 4
out = ROOT / "mobile/assets/selftest"; out.mkdir(parents=True, exist_ok=True)
imgs = (a.images * 3)[:3]
files = []
for i, p in enumerate(imgs):
    im = Image.open(p).convert("RGB"); im.thumbnail((1600, 1600))          # keep the asset small
    dst = out / f"img{i}.jpg"; im.save(dst, quality=95)
    rgb = np.asarray(Image.open(dst).convert("RGB"))                         # reference runs on the exact file the phone gets
    img, lb = S.letterbox(rgb, auto=True)                                    # Ultralytics predict() geometry
    t = np.ascontiguousarray(img.astype(np.float32).transpose(2, 0, 1)[None] / 255.0)
    raw = sess.run(None, {sess.get_inputs()[0].name: t})[0]
    dets = decode_yolov8(raw, nc, lb, 0.35, 0.45)                            # same decoder + thresholds the app uses
    files.append({"file": f"img{i}.jpg", "width": rgb.shape[1], "height": rgb.shape[0],
                  "dets": [{"class_id": d["class_id"], "score": round(d["score"], 4), "bbox": [round(v, 5) for v in d["bbox"]]} for d in dets]})
    print(f"img{i}: {len(dets)} reference detections")
(out / "expected.json").write_text(json.dumps({"conf": 0.35, "iou": 0.45, "confident_score": 0.6, "min_match": a.min_match, "min_mean_iou": 0.9, "images": files}, indent=1))
print("wrote", out)
