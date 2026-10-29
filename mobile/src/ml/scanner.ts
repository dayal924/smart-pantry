/**
 * Detection is 100% ON-DEVICE - online or offline, the backend is never contacted to detect.
 * (The backend is used only afterwards, when the user confirms items into the inventory.)
 */
import * as Crypto from 'expo-crypto';
import { getCatalogItem, normalizeKey } from '../domain/catalog';
import { useSettings } from '../store/settingsStore';
import { onDeviceDetector, prepareImage } from './detector';
import type { Detection, ScanResult } from './types';

const rid = () => Crypto.randomUUID();

function toDetections(raw: any[], names: string[]): Detection[] {
  const info = (id: number) => { const k = normalizeKey(names[id] ?? `class_${id}`); return { k, c: getCatalogItem(k) }; };
  return raw.map((r) => {
    const { k, c } = info(r.classId);
    return {
      id: rid(), classKey: k, label: c.display, emoji: c.emoji, score: r.score,
      bbox: { x: r.bbox[0], y: r.bbox[1], w: r.bbox[2], h: r.bbox[3] },
      alternatives: r.alternatives.map((a: any) => { const x = info(a.classId); return { classKey: x.k, label: x.c.display, score: a.score }; }),
    };
  });
}

export async function scanPhoto(uri: string): Promise<ScanResult> {
  const { conf, iou } = useSettings.getState();
  const t = Date.now();
  const img = await prepareImage(uri);
  const { raw, timings } = await onDeviceDetector.detect(img, conf, iou);
  return {
    scanId: rid(), imageUri: img.uri, imageW: img.width, imageH: img.height, source: 'device',
    detections: toDetections(raw, onDeviceDetector.names), timings, latencyMs: Date.now() - t, detectorVersion: onDeviceDetector.version,
  };
}
