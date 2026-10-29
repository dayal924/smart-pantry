import { create } from 'zustand';
import type { ScanResult } from '../ml/types';

interface ScanState {
  result: ScanResult | null; busy: boolean; error: string | null;
  setResult: (r: ScanResult | null) => void; setBusy: (b: boolean) => void; setError: (e: string | null) => void;
}
export const useScan = create<ScanState>((set) => ({
  result: null, busy: false, error: null,
  setResult: (result) => set({ result }), setBusy: (busy) => set({ busy }), setError: (error) => set({ error }),
}));
