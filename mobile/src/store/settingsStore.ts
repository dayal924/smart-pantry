import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Nutrients } from '../domain/catalog';

export interface Settings {
  conf: number;
  iou: number;
  accel: 'cpu' | 'auto';        // 'auto' tries CoreML / NNAPI and silently falls back to CPU
  autoModelUpdate: boolean;
  notify: boolean;
  targets: Nutrients;
  set: (p: Partial<Omit<Settings, 'set'>>) => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      conf: 0.25, iou: 0.70, accel: 'cpu', autoModelUpdate: true, notify: true,
      targets: { kcal: 2000, carbs_g: 250, fiber_g: 28, vitamin_c_mg: 90, protein_g: 50 },
      set: (p) => set(p),
    }),
    { name: 'settings-v3', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
