/**
 * On-device self-test: pushes 3 bundled photos through the REAL phone pipeline (resize -> letterbox -> ONNX -> decode)
 * and compares with reference detections produced on a PC from the same ONNX using the Ultralytics-equivalent pipeline.
 * A real bug (channel order, scale, padding, wrong labels) fails this loudly; tiny float noise does not.
 */
import * as FileSystem from 'expo-file-system/legacy';
import expected from '../../assets/selftest/expected.json';
import selftestPayload from '../../assets/selftest/selftest_images.json';
import { onDeviceDetector, prepareImage } from './detector';

const IMAGES = [
  require('../../assets/selftest/img0.jpg'),
  require('../../assets/selftest/img1.jpg'),
  require('../../assets/selftest/img2.jpg'),
];

async function resolveSelftestFile(k: number): Promise<string> {
  const cachePath = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}selftest_v2_img${k}.jpg`;
  try {
    const info = await FileSystem.getInfoAsync(cachePath);
    if (!info.exists || info.size === 0) {
      const b64 = (selftestPayload as any)?.images?.[k]?.base64;
      if (b64) {
        await FileSystem.writeAsStringAsync(cachePath, b64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return cachePath;
      }
    } else {
      return cachePath;
    }
  } catch {
    // fallback to asset loader
  }

  try {
    const { Asset } = await import('expo-asset');
    const asset = Asset.fromModule(IMAGES[k]);
    await asset.downloadAsync();
    if (asset.localUri && (asset.localUri.startsWith('file://') || asset.localUri.startsWith('content://'))) {
      return asset.localUri;
    }
  } catch {}

  return cachePath;
}

const iou = (a: number[], b: number[]) => {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const i = ix * iy, u = a[2] * a[3] + b[2] * b[3] - i;
  return u > 0 ? i / u : 0;
};

export interface SelfTestResult { pass: boolean; matched: number; total: number; meanIou: number; avgMs: number; modelMs: number; provider: string; lines: string[] }

export async function runSelfTest(): Promise<SelfTestResult> {
  const info = await onDeviceDetector.init();
  const lines: string[] = [];
  let matched = 0, total = 0, ioSum = 0, ms = 0, model = 0;
  for (let k = 0; k < IMAGES.length; k++) {
    const exp = expected.images[k];
    if (!exp) continue;
    const uri = await resolveSelftestFile(k);
    const t0 = Date.now();
    const img = await prepareImage(uri);
    const { raw, timings } = await onDeviceDetector.detect(img, expected.conf, expected.iou);
    ms += Date.now() - t0; model += timings.inference;
    const conf = exp.dets.filter((d) => d.score >= expected.confident_score);
    let m = 0;
    for (const e of conf) {
      const best = raw.reduce<{ i: number; c: number } | null>((b, r) => { const v = iou(e.bbox, r.bbox); return !b || v > b.i ? { i: v, c: r.classId } : b; }, null);
      total++;
      if (best && best.i >= 0.5 && best.c === e.class_id) { m++; matched++; ioSum += best.i; }
    }
    lines.push(`photo ${k + 1}: ${m}/${conf.length} confident boxes reproduced (phone found ${raw.length}, reference ${exp.dets.length})`);
  }
  const meanIou = matched ? ioSum / matched : 0;
  const pass = total > 0 && matched / total >= expected.min_match && meanIou >= expected.min_mean_iou;
  return { pass, matched, total, meanIou, avgMs: Math.round(ms / IMAGES.length), modelMs: Math.round(model / IMAGES.length), provider: info.provider, lines };
}
