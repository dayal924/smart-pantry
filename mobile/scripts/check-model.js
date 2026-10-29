// Fails fast (with a helpful message) when the ONNX model isn't in place - Metro would otherwise
// die with an obscure "Unable to resolve module detector.onnx".
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'model');
const onnx = path.join(dir, 'detector.onnx'), labelsPath = path.join(dir, 'labels.json');
const fail = (m) => { console.error('\n❌ ' + m + '\n'); process.exit(1); };
if (!fs.existsSync(onnx)) fail('mobile/assets/model/detector.onnx is missing.\n   Run:  python ml/export_onnx.py --weights <best.pt> --version v1');
const labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
if (labels.placeholder) fail('assets/model/labels.json is still the PLACEHOLDER. Run ml/export_onnx.py to write the real class list.');
console.log(`✅ model ok: ${(fs.statSync(onnx).size / 1e6).toFixed(1)} MB, ${labels.names.length} classes, version ${labels.version}`);
