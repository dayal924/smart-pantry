Place **detector.onnx** and the real **labels.json** here by running `python ml/export_onnx.py --weights <best.pt> --version v1`.
The app bundles this model so scanning works with no network at all; newer versions arrive over the air (see src/ml/modelManager.ts).
