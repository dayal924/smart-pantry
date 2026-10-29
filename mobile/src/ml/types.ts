import type { Storage } from '../domain/catalog';

export interface AltClass { classKey: string; label: string; score: number }
export interface Detection {
  id: string;
  classKey: string;
  label: string;
  emoji: string;
  score: number;
  /** Normalised to the displayed image, top-left origin: [x, y, width, height] in 0..1 */
  bbox: { x: number; y: number; w: number; h: number };
  alternatives: AltClass[];
  correctedFrom?: string; // set when the user overrides the class
  removed?: boolean;      // user marked it a false positive
}
export type ScanSource = 'device';
export interface ScanTimings { prepare: number; inference: number; postprocess: number }
export interface ScanResult {
  scanId: string;
  imageUri: string;
  imageW: number;
  imageH: number;
  source: ScanSource;
  detections: Detection[];
  latencyMs: number;
  timings: Partial<ScanTimings>;
  detectorVersion: string;
  note?: string;
}
export interface ModelInfo { version: string; source: 'bundled' | 'ota'; inputSize: number; numClasses: number; warmupMs: number; provider: string }
export type { Storage };
