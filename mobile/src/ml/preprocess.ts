/**
 * Letterbox maths + tensor fill - PURE and unit-testable.
 * Mirrors Ultralytics LetterBox(auto=True, stride=32) = what `model.predict()` (PyTorch) does:
 * keep aspect ratio, pad with grey 114 only up to a multiple of 32 (so 4:3 -> 640x480 tensor, not 640x640).
 * The exported ONNX has dynamic height/width, so this is valid and ~25-45% cheaper than a full square.
 */
import type { Letterbox } from './postprocess';

export const PAD_VALUE = 114;
export const STRIDE = 32;

/** Size the content must be resized to so its long side == `size` (aspect preserved, NOT stretched). */
export function targetSize(srcW: number, srcH: number, size = 640): { w: number; h: number } {
  const r = Math.min(size / srcW, size / srcH);
  return { w: Math.max(1, Math.round(srcW * r)), h: Math.max(1, Math.round(srcH * r)) };
}

/** Geometry from the size the resizer ACTUALLY produced (decW/decH may differ by 1px from targetSize). */
export function makeLetterbox(srcW: number, srcH: number, decW: number, decH: number, size = 640, auto = true): Letterbox {
  let dw = size - decW, dh = size - decH;
  if (auto) { dw %= STRIDE; dh %= STRIDE; }
  dw /= 2; dh /= 2;
  const left = Math.round(dw - 0.1), right = Math.round(dw + 0.1), top = Math.round(dh - 0.1), bottom = Math.round(dh + 0.1);
  return {
    size, origW: srcW, origH: srcH, sx: decW / srcW, sy: decH / srcH, padX: left, padY: top, newW: decW, newH: decH,
    canvasW: decW + left + right, canvasH: decH + top + bottom,
  };
}

/** Write decoded pixels into a CHW float32 tensor: RGB order, /255, grey padding. `out` length must be 3*canvasW*canvasH. */
export function fillTensor(pixels: ArrayLike<number>, w: number, h: number, channels: 3 | 4, lb: Letterbox, out: Float32Array): void {
  const W = lb.canvasW, H = lb.canvasH, plane = W * H;
  if (out.length !== 3 * plane) throw new Error('tensor buffer has wrong size');
  if (w + lb.padX > W || h + lb.padY > H) throw new Error('decoded image does not fit letterbox');
  out.fill(PAD_VALUE / 255);
  const inv = 1 / 255;
  for (let y = 0; y < h; y++) {
    let p = y * w * channels;
    let o = (y + lb.padY) * W + lb.padX;
    for (let x = 0; x < w; x++, p += channels, o++) {
      out[o] = pixels[p] * inv;
      out[plane + o] = pixels[p + 1] * inv;
      out[2 * plane + o] = pixels[p + 2] * inv;
    }
  }
}
