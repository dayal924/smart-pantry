/**
 * Model lifecycle: bundled model (always works offline) + over-the-air updates from the admin registry.
 * A downloaded model is only activated after hash check AND a successful warm-up inference.
 */
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { api, API_URL } from '../services/api';
import { useAuth } from '../store/authStore';
import { bundledLabels, LabelSet } from './labels';
import { BUNDLED_MODEL } from './modelAsset';

const DIR = FileSystem.documentDirectory + 'models/';
const ACTIVE = DIR + 'active.json';

export interface ResolvedModel { path: string; labels: LabelSet; version: string; source: 'bundled' | 'ota' }

async function readActive(): Promise<{ version: string; file: string; labels: LabelSet } | null> {
  try {
    const info = await FileSystem.getInfoAsync(ACTIVE);
    if (!info.exists) return null;
    const a = JSON.parse(await FileSystem.readAsStringAsync(ACTIVE));
    return (await FileSystem.getInfoAsync(a.file)).exists ? a : null;
  } catch { return null; }
}

export async function resolveBundled(): Promise<ResolvedModel> {
  const asset = Asset.fromModule(BUNDLED_MODEL);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('Bundled detector.onnx could not be resolved');
  return { path: asset.localUri, labels: bundledLabels, version: bundledLabels.version, source: 'bundled' };
}

export async function resolveModel(preferBundled = false): Promise<ResolvedModel> {
  if (!preferBundled) {
    const a = await readActive();
    if (a) return { path: a.file, labels: a.labels, version: a.version, source: 'ota' };
  }
  return resolveBundled();
}

export type UpdateResult =
  | { status: 'up-to-date'; version: string }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string };

/** Check registry and download if newer. `validate` must load the file and run a warm-up pass. */
export async function checkForModelUpdate(
  currentVersion: string,
  validate: (m: ResolvedModel) => Promise<void>,
  onProgress?: (pct: number) => void,
): Promise<UpdateResult> {
  try {
    const latest = await api.latestModel();
    if (latest.version === currentVersion) return { status: 'up-to-date', version: currentVersion };
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
    const tmp = `${DIR}detector-${latest.version}.onnx.part`;
    const final = `${DIR}detector-${latest.version}.onnx`;
    const dl = FileSystem.createDownloadResumable(
      API_URL + latest.download_url, tmp, { headers: { Authorization: `Bearer ${useAuth.getState().access}` } },
      (p) => onProgress?.(p.totalBytesExpectedToWrite ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0),
    );
    const res = await dl.downloadAsync();
    if (!res || res.status !== 200) throw new Error(`Download failed (${res?.status ?? 'no response'})`);
    const info = await FileSystem.getInfoAsync(tmp, { md5: true, size: true } as any);
    if (!info.exists || (info as any).md5 !== latest.md5) { await FileSystem.deleteAsync(tmp, { idempotent: true }); throw new Error('Checksum mismatch - download discarded'); }
    await FileSystem.moveAsync({ from: tmp, to: final });
    const labels: LabelSet = { version: latest.version, inputSize: latest.input_size ?? 640, names: latest.labels };
    await validate({ path: final, labels, version: latest.version, source: 'ota' }); // throws -> keep old model
    await FileSystem.writeAsStringAsync(ACTIVE, JSON.stringify({ version: latest.version, file: final, labels }));
    return { status: 'downloaded', version: latest.version };
  } catch (e: any) {
    return { status: 'error', message: e?.message ?? String(e) };
  }
}

export async function revertToBundled(): Promise<void> {
  await FileSystem.deleteAsync(ACTIVE, { idempotent: true });
}
