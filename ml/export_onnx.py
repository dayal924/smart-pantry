"""Export your trained YOLOv8 weights for the app.

    python ml/export_onnx.py --weights runs/train/fruits_vegi_yolo/weights/best.pt --version v1

Produces (and copies to mobile/assets/model + backend/storage/models):
  detector.onnx  - static 1x3x640x640 input, opset 12, simplified, fp32  (best accuracy/compat on phones)
  labels.json    - class names in model order + normalised keys   (names MUST match the model's order)
Why static + opset 12: the notebook exported dynamic=True/opset 14. Dynamic axes block several mobile
graph optimisations; the app always feeds 640x640 so nothing is lost.
"""
import argparse, hashlib, json, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def norm(label: str, aliases: dict) -> str:
    k = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return aliases.get(k, k)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", required=True)
    ap.add_argument("--version", required=True, help="e.g. v1, 2026-10-yolov8s")
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--half", action="store_true", help="fp16 weights (smaller; verify accuracy with parity_test.py first)")
    a = ap.parse_args()

    from ultralytics import YOLO
    model = YOLO(a.weights)
    out = pathlib.Path(model.export(format="onnx", imgsz=a.imgsz, opset=12, simplify=True, dynamic=False, half=a.half))
    names = [model.names[i] for i in sorted(model.names)]
    cat = json.loads((ROOT / "shared" / "produce_catalog.json").read_text())
    keys = [norm(n, cat["aliases"]) for n in names]
    labels = {"version": a.version, "input_size": a.imgsz, "names": names, "keys": keys}

    miss = [k for k in keys if k not in cat["items"]]
    print(f"{len(names)} classes. Missing from shared/produce_catalog.json (will use generic shelf-life): {miss or 'none'}")
    if miss:
        print("  -> add them in shared/build_data.py and re-run it, then rebuild the app.")

    for dest in (ROOT / "mobile/assets/model", ROOT / "backend/storage/models"):
        dest.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(out, dest / "detector.onnx")
        (dest / "labels.json").write_text(json.dumps(labels, indent=1))
    sha = hashlib.sha256(out.read_bytes()).hexdigest()
    print(f"detector.onnx {out.stat().st_size/1e6:.1f} MB  sha256={sha[:16]}…  version={a.version}")
    print("Next: python ml/parity_test.py --weights", a.weights, "--images <folder>")


if __name__ == "__main__":
    sys.exit(main())
