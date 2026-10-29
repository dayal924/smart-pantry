/** Cross-language check: the TypeScript decoder must reproduce the Python reference exactly.
 *  Run:  npm run test:golden   (generate vectors first with: python ml/make_golden.py) */
import fs from 'fs';
import path from 'path';
import { decodeYolov8 } from '../src/ml/postprocess';
import { makeLetterbox, targetSize, fillTensor, PAD_VALUE } from '../src/ml/preprocess';

const golden = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared/golden/postprocess_golden.json'), 'utf8'));
const cases = golden.decode;
let failed = 0;
const near = (a: number, b: number, t = 1e-9) => Math.abs(a - b) <= t;

cases.forEach((c: any, ci: number) => {
  const t = targetSize(c.origW, c.origH, 640);
  const lb = makeLetterbox(c.origW, c.origH, t.w, t.h, 640);
  const got = decodeYolov8(Float32Array.from(c.data), c.layout, c.nc, lb, { conf: c.conf, iou: c.iou });
  const exp = c.expected;
  const errs: string[] = [];
  if (got.length !== exp.length) errs.push(`count ${got.length} != ${exp.length}`);
  for (let i = 0; i < Math.min(got.length, exp.length); i++) {
    const g = got[i], e = exp[i];
    if (g.classId !== e.class_id) errs.push(`#${i} class ${g.classId} != ${e.class_id}`);
    if (!near(g.score, e.score)) errs.push(`#${i} score`);
    e.bbox.forEach((v: number, k: number) => { if (!near(g.bbox[k], v, 1e-9)) errs.push(`#${i} bbox[${k}] ${g.bbox[k]} != ${v}`); });
    const ga = g.alternatives.map((a) => a.classId).join(','), ea = e.alternatives.map((a: any) => a.class_id).join(',');
    if (ga !== ea) errs.push(`#${i} alternatives ${ga} != ${ea}`);
  }
  console.log(`case ${ci} (${c.origW}x${c.origH}, nc=${c.nc}): ${exp.length} detections -> ${errs.length ? '❌ ' + errs.slice(0, 5).join('; ') : '✅ match'}`);
  failed += errs.length ? 1 : 0;
});

// letterbox geometry == Ultralytics (cv2 replica) for many real photo shapes
for (const g of golden.geometry) {
  const t = targetSize(g.w, g.h, 640), lb = makeLetterbox(g.w, g.h, t.w, t.h, 640);
  const ok = t.w === g.newW && t.h === g.newH && lb.padX === g.padX && lb.padY === g.padY && lb.canvasW === g.canvasW && lb.canvasH === g.canvasH;
  if (!ok) { failed++; console.log(`geometry ${g.w}x${g.h}: ❌ got new ${t.w}x${t.h} pad ${lb.padX},${lb.padY} canvas ${lb.canvasW}x${lb.canvasH}`); }
}
console.log(`letterbox geometry (${golden.geometry.length} photo shapes vs Ultralytics replica): ${failed === 0 ? '✅ identical' : '❌'}`);

// letterbox tensor sanity: padding value, channel order, placement
{
  const w = 8, h = 4, size = 16;
  const lb = makeLetterbox(w, h, w, h, size, false);
  const px = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) { px[i * 4] = 255; px[i * 4 + 1] = 0; px[i * 4 + 2] = 0; px[i * 4 + 3] = 255; }
  const buf = new Float32Array(3 * size * size);
  fillTensor(px, w, h, 4, lb, buf);
  const plane = size * size, mid = (lb.padY + 1) * size + lb.padX + 1;
  const ok = near(buf[0], PAD_VALUE / 255, 1e-7) && buf[mid] === 1 && buf[plane + mid] === 0 && lb.padY === 6 && lb.padX === 4;
  console.log(`letterbox tensor fill: ${ok ? '✅' : '❌'}`); if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
