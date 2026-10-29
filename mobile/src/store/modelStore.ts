import { create } from 'zustand';
import { onDeviceDetector } from '../ml/detector';
import type { ModelInfo } from '../ml/types';

interface ModelState {
  status: 'idle' | 'loading' | 'ready' | 'error'; info: ModelInfo | null; error: string | null; progress: number | null;
  load: (accel: 'cpu' | 'auto', force?: boolean) => Promise<void>;
  update: () => Promise<string>;
}
export const useModel = create<ModelState>((set, get) => ({
  status: 'idle', info: null, error: null, progress: null,
  load: async (accel, force) => {
    set({ status: 'loading', error: null });
    try { set({ status: 'ready', info: await onDeviceDetector.init(accel, force) }); }
    catch (e: any) { set({ status: 'error', error: e?.message ?? String(e) }); }
  },
  update: async () => {
    set({ progress: 0 });
    const r = await onDeviceDetector.updateModel((p) => set({ progress: p }));
    set({ progress: null, info: onDeviceDetector.info });
    return r.status === 'downloaded' ? `Updated to ${r.version}` : r.status === 'up-to-date' ? `Already latest (${r.version})` : `Update failed: ${r.message}`;
  },
}));
