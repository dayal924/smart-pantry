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
  polygon?: Array<{ x: number; y: number }>;
  estimatedWeightG?: number;
  isSegmented?: boolean;
  alternatives: { classId: number; score: number }[];
}

export const PRODUCE_DENSITIES: Record<string, number> = {
  apple: 0.85, banana: 0.95, beetroot: 1.02, bitter_gourd: 0.88, bottle_gourd: 0.92,
  cabbage: 0.65, capsicum: 0.55, carrot: 1.03, cauliflower: 0.70, cherry: 1.02,
  chilli: 0.60, coconut: 0.82, cucumber: 0.96, eggplant: 0.65, ginger: 1.00,
  grape: 1.04, green_orange: 0.95, kiwi: 0.98, maize: 0.85, mango: 0.97,
  melon: 0.92, okra: 0.70, onion: 0.95, orange: 0.96, peach: 0.94,
  pear: 0.95, peas: 0.75, pineapple: 0.90, pomegranate: 1.01, potato: 1.05,
  radish: 0.98, strawberry: 0.92, tomato: 0.95, turnip: 0.96, watermelon: 0.96,
};

type Box = [number, number, number, number];
function iouOf(a: Box, b: Box): number {
  const ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Decodes YOLOv8 Detection or Segmentation model outputs.
 * @param data       flat output tensor (Float32Array from onnxruntime)
 * @param dims       [1, 4+nc, N] (Detection) or [1, 4+nc+32, N] (Segmentation)
 * @param protoData  optional prototype mask tensor (Float32Array [1, 32, 160, 160])
 * @param protoDims  optional prototype mask dims [1, 32, 160, 160]
 */
export function decodeYolov8(
  data: ArrayLike<number>,
  dims: readonly number[],
  nc: number,
  lb: Letterbox,
  options: Partial<DecodeOptions> = {},
  protoData?: ArrayLike<number> | null,
  protoDims?: readonly number[] | null,
  classKeys?: readonly string[],
): RawDetection[] {
  const o = { ...DEFAULT_DECODE, ...options };
  const numMaskCoeffs = 32;
  const isSeg = dims.length === 3 && (dims[1] === nc + 4 + numMaskCoeffs || dims[2] === nc + 4 + numMaskCoeffs);
  const C = isSeg ? nc + 4 + numMaskCoeffs : nc + 4;
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

  // 4) un-letterbox, normalise, extract mask polygon & estimated weight
  const out: RawDetection[] = [];
  const clampX = (v: number) => Math.min(Math.max((v - lb.padX) / lb.sx, 0), lb.origW);
  const clampY = (v: number) => Math.min(Math.max((v - lb.padY) / lb.sy, 0), lb.origH);

  // Prototype dimensions
  const hasProto = isSeg && protoData != null && protoDims != null && protoDims.length === 4;
  const protoC = hasProto ? protoDims![1] : 0;
  const protoH = hasProto ? protoDims![2] : 0;
  const protoW = hasProto ? protoDims![3] : 0;
  const protoArea = protoH * protoW;

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
    const normW = (x2 - x1) / lb.origW;
    const normH = (y2 - y1) / lb.origH;

    let polygon: Array<{ x: number; y: number }> | undefined;
    let maskPixelCount = 0;

    // Decode segmentation mask from prototype tensor if available
    if (hasProto && protoW > 0 && protoH > 0) {
      const scaleX = protoW / lb.canvasW;
      const scaleY = protoH / lb.canvasH;
      const px1 = Math.max(0, Math.min(protoW - 1, Math.floor(f.box[0] * scaleX)));
      const py1 = Math.max(0, Math.min(protoH - 1, Math.floor(f.box[1] * scaleY)));
      const px2 = Math.max(0, Math.min(protoW - 1, Math.ceil(f.box[2] * scaleX)));
      const py2 = Math.max(0, Math.min(protoH - 1, Math.ceil(f.box[3] * scaleY)));

      // Extract 32 mask coefficients for this anchor
      const coeffs = new Float32Array(numMaskCoeffs);
      for (let j = 0; j < numMaskCoeffs; j++) {
        coeffs[j] = at(4 + nc + j, f.i);
      }

      const topProfile: Array<{ px: number; py: number }> = [];
      const bottomProfile: Array<{ px: number; py: number }> = [];

      // Step along rows in the bounding box region
      const stepY = Math.max(1, Math.floor((py2 - py1) / 32));
      for (let py = py1; py <= py2; py += stepY) {
        let firstX = -1;
        let lastX = -1;
        for (let px = px1; px <= px2; px++) {
          let sum = 0;
          for (let c = 0; c < numMaskCoeffs; c++) {
            sum += coeffs[c] * (protoData![c * protoArea + py * protoW + px] as number);
          }
          if (sum > 0.0) { // sigmoid(sum) > 0.5
            maskPixelCount++;
            if (firstX === -1) firstX = px;
            lastX = px;
          }
        }
        if (firstX !== -1 && lastX !== -1) {
          topProfile.push({ px: lastX, py });
          bottomProfile.push({ px: firstX, py });
        }
      }

      if (topProfile.length >= 2) {
        // Construct closed perimeter: right edge going down, left edge going up
        const combined = [...topProfile, ...bottomProfile.reverse()];
        polygon = combined.map((pt) => ({
          x: Math.min(1, Math.max(0, clampX(pt.px / scaleX) / lb.origW)),
          y: Math.min(1, Math.max(0, clampY(pt.py / scaleY) / lb.origH)),
        }));
      }
    }

    // 3D Volumetric Portion Weight Estimation
    const cKey = classKeys && classKeys[f.cls]
      ? classKeys[f.cls].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
      : 'apple';
    const density = PRODUCE_DENSITIES[cKey] ?? 0.95;

    // Approximate physical dimensions assuming standard kitchen scanning distance
    // Typical camera FOV spans ~35-45cm width at table height
    const assumedFovWidthCm = 38.0;
    const realW_cm = normW * assumedFovWidthCm;
    const realH_cm = normH * assumedFovWidthCm * (lb.origH / lb.origW);

    const majorAxis = Math.max(realW_cm, realH_cm) / 2.0;
    const minorAxis = Math.min(realW_cm, realH_cm) / 2.0;

    const isCylindrical = ['banana', 'carrot', 'cucumber', 'bitter_gourd', 'bottle_gourd', 'radish'].includes(cKey);
    let volumeCm3: number;
    if (isCylindrical) {
      volumeCm3 = Math.PI * Math.pow(minorAxis, 2) * (2.0 * majorAxis);
    } else {
      volumeCm3 = (4.0 / 3.0) * Math.PI * majorAxis * Math.pow(minorAxis, 2);
    }

    // Adjust volume by mask fill factor (default 0.70 for spheroids, 0.45 for elongated produce)
    const fillFactor = maskPixelCount > 0 ? Math.min(0.85, Math.max(0.30, maskPixelCount / Math.max(1, (normW * normH * 160 * 160)))) : 0.65;
    const estimatedWeightG = Math.max(10, Math.round(volumeCm3 * density * fillFactor));

    out.push({
      classId: f.cls,
      score: f.score,
      bbox: [x1 / lb.origW, y1 / lb.origH, normW, normH],
      polygon,
      estimatedWeightG,
      isSegmented: isSeg && polygon != null && polygon.length > 2,
      alternatives: altList,
    });
  }
  return out;
}
