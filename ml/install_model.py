"""Install your trained model into the app. No Ultralytics needed - only onnxruntime.

    python ml/install_model.py --onnx path/to/best.onnx --version v1 [--publish]

 - validates the ONNX (input 1x3x640x640, output [1, 4+nc, N])
 - reads the class names embedded by Ultralytics and writes mobile/assets/model/labels.json
 - copies the model to mobile/assets/model/detector.onnx   (bundled => works offline)
 - --publish also copies it to backend/storage/models/<version>/ so phones can fetch it OTA
"""
import argparse, ast, json, pathlib, re, shutil, sys
import onnxruntime as ort

ROOT = pathlib.Path(__file__).resolve().parents[1]


def norm(label, aliases):
    k = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return aliases.get(k, k)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--onnx", required=True); ap.add_argument("--version", default="v1"); ap.add_argument("--publish", action="store_true")
    a = ap.parse_args()
    src = pathlib.Path(a.onnx)
    sess = ort.InferenceSession(str(src), providers=["CPUExecutionProvider"])
    meta = sess.get_modelmeta().custom_metadata_map or {}
    if "names" not in meta:
        sys.exit("❌ This ONNX has no 'names' metadata (not an Ultralytics export?).")
    d = ast.literal_eval(meta["names"]); names = [d[i] for i in sorted(d)]
    inp, out = sess.get_inputs()[0], sess.get_outputs()[0]
    print(f"input  {inp.name} {inp.shape}\noutput {out.name} {out.shape}")
    o = out.shape
    if not (len(o) == 3 and (o[1] == len(names) + 4 or o[2] == len(names) + 4)):
        sys.exit(f"❌ Output {o} doesn't look like YOLOv8 detect with {len(names)} classes.")
    imgsz = 640
    try:
        imgsz = ast.literal_eval(meta.get("imgsz", "[640, 640]"))[0]
    except Exception:
        pass

    dest = ROOT / "mobile/assets/model"; dest.mkdir(parents=True, exist_ok=True)
    old = dest / "labels.json"
    if old.exists():
        prev = json.loads(old.read_text()).get("names")
        if prev and not json.loads(old.read_text()).get("placeholder") and prev != names:
            print("⚠️  Class list/order differs from the labels.json already in the app - the ONNX's own list wins.")
    cat = json.loads((ROOT / "shared/produce_catalog.json").read_text())
    keys = [norm(n, cat["aliases"]) for n in names]
    (dest / "labels.json").write_text(json.dumps({"version": a.version, "input_size": imgsz, "names": names, "keys": keys}, indent=1))
    shutil.copyfile(src, dest / "detector.onnx")
    mb = src.stat().st_size / 1e6
    print(f"✅ {len(names)} classes -> mobile/assets/model/labels.json | detector.onnx {mb:.0f} MB")
    miss = [k for k in keys if k not in cat["items"]]
    print("catalog coverage:", "all classes have shelf-life data ✅" if not miss else f"missing {miss} (generic shelf-life will be used)")
    if mb > 60:
        print("ℹ️  Large model. For faster load/inference re-export static:  yolo export model=best.pt format=onnx imgsz=640 opset=12 simplify=True dynamic=False")
    if a.publish:
        pub = ROOT / "backend/storage/models" / a.version; pub.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, pub / "detector.onnx"); print(f"📦 copied for OTA -> {pub} (then upload via POST /admin/models)")


if __name__ == "__main__":
    main()
