"""PyTorch (Ultralytics) vs ONNX-with-app-pipeline parity (rectangular letterbox = what predict() does).

Unlike the notebook's version this uses LETTERBOX preprocessing - identical to the phone
(mobile/src/ml/preprocess.ts) and to Ultralytics itself. A stretch-resize test can pass while hiding
the accuracy loss a stretched mobile pipeline would cause.

    python ml/parity_test.py --weights best.pt --onnx mobile/assets/model/detector.onnx --images dataset/valid/images
"""
import argparse, pathlib, sys
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.services.detector import DetectorService  # noqa: E402


def iou(a, b):
    ix = max(0, min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0])); iy = max(0, min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1]))
    i = ix * iy; u = a[2] * a[3] + b[2] * b[3] - i
    return i / u if u else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", required=True); ap.add_argument("--images", required=True)
    ap.add_argument("--onnx", default=str(ROOT / "mobile/assets/model/detector.onnx"))
    ap.add_argument("--n", type=int, default=40); ap.add_argument("--conf", type=float, default=0.35); ap.add_argument("--iou", type=float, default=0.45)
    a = ap.parse_args()
    from ultralytics import YOLO
    pt = YOLO(a.weights)
    det = DetectorService(); det.load(a.onnx)
    files = sorted(p for p in pathlib.Path(a.images).glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png"))[: a.n]
    tot_ref = tot_match = cls_ok = 0; count_eq = 0; ious = []
    for f in files:
        ref = pt.predict(str(f), conf=a.conf, iou=a.iou, verbose=False)[0]
        mine = det.detect(Image.open(f), a.conf, a.iou)["detections"]
        count_eq += int(len(ref.boxes) == len(mine))
        for b in ref.boxes:
            x1, y1, x2, y2 = b.xyxyn[0].tolist(); rb = [x1, y1, x2 - x1, y2 - y1]
            best = max(mine, key=lambda d: iou(rb, d["bbox"]), default=None)
            tot_ref += 1
            if best and iou(rb, best["bbox"]) >= 0.5:
                tot_match += 1; ious.append(iou(rb, best["bbox"])); cls_ok += int(best["class_id"] == int(b.cls[0]))
    print(f"images={len(files)}  same-detection-count={count_eq/len(files):.1%}")
    print(f"ref boxes matched (IoU>=0.5)={tot_match/max(tot_ref,1):.1%}  mean IoU={np.mean(ious) if ious else 0:.3f}  class agreement={cls_ok/max(tot_match,1):.1%}")
    ok = tot_match / max(tot_ref, 1) >= 0.98 and cls_ok / max(tot_match, 1) >= 0.98
    print("PARITY:", "PASS" if ok else "CHECK preprocessing / export settings")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
