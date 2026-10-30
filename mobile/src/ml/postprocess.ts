/**
 * YOLOv8 ONNX decode - PURE (no React Native imports) so it is unit-testable in Node.
 * Mirror of backend/app/services/detector.py decode_yolov8(); locked together by shared/golden.
 */
export interface Letterbox {
  size: number; origW: number; origH: number;
  canvasW: number; canvasH: number; // model input tensor size (rectangular, multiples of 32)
  sx: number; sy: number;      // content scale (decoded px / source px)
  padX: number; padY: number;  // integer padding added left/top
  newW: number; newH: number;  // decoded content size inside the square
}
export interface DecodeOptions { conf: number; iou: number; agnosticIou: number; maxDet: number; topAlt: number }
export const DEFAULT_DECODE: DecodeOptions = { conf: 0.25, iou: 0.70, agnosticIou: 0.85, maxDet: 100, topAlt: 3 };

export interface RawDetection {
  classId: number;
  score: number;
  /** normalised [x, y, w, h], top-left origin, relative to the source image */
  bbox: [number, number, number, number];
  alternatives: { classId: number; score: number }[];
}

type Box = [number, number, number, number];
function iouOf(a: Box, b: Box): number {
  const ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * @param data  flat output tensor (Float32Array from onnxruntime)
 * @param dims  [1, 4+nc, N] (Ultralytics default) or [1, N, 4+nc]
 */
export function decodeYolov8(
  data: ArrayLike<number>, dims: readonly number[], nc: number, lb: Letterbox, options: Partial<DecodeOptions> = {},
): RawDetection[] {
  const o = { ...DEFAULT_DECODE, ...options };
  const C = nc + 4;
  let N: number, cStride: number, iStride: number;
  if (dims.length === 3 && dims[1] === C) { N = dims[2]; cStride = N; iStride = 1; }
  else if (dims.length === 3 && dims[2] === C) { N = dims[1]; cStride = 1; iStride = C; }
  else throw new Error(`Unexpected output dims [${dims.join(',')}] for ${nc} classes`);
  const at = (c: number, i: number) => data[c * cStride + i * iStride];

  // 1) confidence filter (best class per anchor)
  const cands: { i: number; cls: number; score: number }[] = [];
  for (let i = 0; i < N; i++) {
    let best = -1, bc = 0;
    for (let c = 0; c < nc; c++) {
      const s = at(4 + c, i);
      if (s > best) { best = s; bc = c; }
    }
    if (best >= o.conf) cands.push({ i, cls: bc, score: best });
  }
  cands.sort((a, b) => b.score - a.score || a.i - b.i);
  const boxOf = (i: number): Box => {
    const cx = at(0, i), cy = at(1, i), w = at(2, i), h = at(3, i);
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  };

  // 2) class-aware NMS
  const kept: { i: number; cls: number; score: number; box: Box }[] = [];
  for (const c of cands) {
    const b = boxOf(c.i);
    let dup = false;
    for (const k of kept) if (k.cls === c.cls && iouOf(b, k.box) > o.iou) { dup = true; break; }
    if (!dup) kept.push({ ...c, box: b });
  }

  // 3) merge cross-class near-duplicates -> they become "alternatives" for the tap-to-correct dropdown
  const fin: { i: number; cls: number; score: number; box: Box; merged: Map<number, number> }[] = [];
  for (const k of kept) {
    const host = fin.find((f) => iouOf(k.box, f.box) > o.agnosticIou);
    if (host) host.merged.set(k.cls, Math.max(host.merged.get(k.cls) ?? 0, k.score));
    else fin.push({ ...k, merged: new Map() });
  }

  // 4) un-letterbox, normalise, attach alternatives
  const out: RawDetection[] = [];
  const clampX = (v: number) => Math.min(Math.max((v - lb.padX) / lb.sx, 0), lb.origW);
  const clampY = (v: number) => Math.min(Math.max((v - lb.padY) / lb.sy, 0), lb.origH);
  for (const f of fin.slice(0, o.maxDet)) {
    const alts = new Map(f.merged);
    const order = Array.from({ length: nc }, (_, k) => k).sort((a, b) => at(4 + b, f.i) - at(4 + a, f.i) || a - b);
    for (const k of order.slice(0, o.topAlt + 1)) {
      if (k !== f.cls) alts.set(k, Math.max(alts.get(k) ?? 0, at(4 + k, f.i)));
    }
    alts.delete(f.cls);
    const altList = [...alts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, o.topAlt)
      .map(([classId, score]) => ({ classId, score }));
    const x1 = clampX(f.box[0]), y1 = clampY(f.box[1]), x2 = clampX(f.box[2]), y2 = clampY(f.box[3]);
    out.push({
      classId: f.cls, score: f.score,
      bbox: [x1 / lb.origW, y1 / lb.origH, (x2 - x1) / lb.origW, (y2 - y1) / lb.origH],
      alternatives: altList,
    });
  }
  return out;
}
