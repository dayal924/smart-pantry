import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCatalogItem, normalizeKey, Nutrients, nutrientsForGrams, Storage } from '../domain/catalog';
import { BUNDLED_RECIPES, Recipe } from '../domain/recipeMatch';
import { changeStorage, initialExpiry } from '../domain/shelfLife';

export type ItemStatus = 'active' | 'consumed' | 'discarded';
export interface PantryItem {
  id: string; classKey: string; name: string; emoji: string; quantity: number; storage: Storage;
  addedAt: number; anchorAt: number; lifeUsed: number; expiresAt: number;
  status: ItemStatus; closedAt?: number; source: 'scan' | 'manual' | 'split'; scanId?: string; updatedAt: number; deleted?: boolean;
}
export interface ConsumptionLog { id: string; itemId?: string; classKey: string; grams: number; kind: 'consumed' | 'recipe'; nutrients: Nutrients; date: number }
export interface QueuedScanLog { clientScanId: string; payload: any }
export interface NewEntry { classKey: string; quantity: number; storage?: Storage; scanId?: string; source?: 'scan' | 'manual' }

export interface ScanHistoryRecord {
  id: string;
  createdAt: number;
  detectorVersion: string;
  latencyMs: number;
  timings?: Record<string, number>;
  numDetections: number;
  items: {
    classKey: string;
    name: string;
    emoji: string;
    quantity: number;
    storage: Storage;
    confidence?: number;
  }[];
}

const uid = () => Crypto.randomUUID();
const r3 = (n: number) => Math.round(n * 1000) / 1000;

interface PantryState {
  items: PantryItem[]; logs: ConsumptionLog[]; scanLogs: QueuedScanLog[]; scanHistory: ScanHistoryRecord[];
  customRecipes: Recipe[];
  dirtyItems: string[]; dirtyLogs: string[]; lastSync: string | null; recipes: Recipe[];
  addEntries: (e: NewEntry[]) => void;
  setStorage: (id: string, s: Storage) => void;
  closeItem: (id: string, status: 'consumed' | 'discarded', qty?: number) => void;
  cook: (recipe: Recipe) => { used: string[]; short: string[] };
  queueScanLog: (l: QueuedScanLog) => void;
  dropScanLogs: (ids: string[]) => void;
  addScanRecord: (record: ScanHistoryRecord) => void;
  setScanHistory: (records: ScanHistoryRecord[]) => void;
  addCustomRecipe: (r: Recipe) => void;
  removeCustomRecipe: (id: string) => void;
  mergeServer: (items: PantryItem[], serverTime: string) => void;
  markSynced: (items: Record<string, number>, logs: string[]) => void;
  setRecipes: (r: Recipe[]) => void;
  reset: () => void;
}

function splitClose(items: PantryItem[], id: string, status: 'consumed' | 'discarded', units: number, now: number) {
  const src = items.find((i) => i.id === id)!;
  const u = Math.min(units, src.quantity);
  const dirty: string[] = [id];
  let next: PantryItem[];
  if (u >= src.quantity - 1e-6) {
    next = items.map((i) => (i.id === id ? { ...i, status, closedAt: now, updatedAt: now } : i));
  } else {
    const closed: PantryItem = { ...src, id: uid(), quantity: r3(u), status, closedAt: now, source: 'split', updatedAt: now };
    dirty.push(closed.id);
    next = [...items.map((i) => (i.id === id ? { ...i, quantity: r3(i.quantity - u), updatedAt: now } : i)), closed];
  }
  return { next, dirty, units: u, src };
}

export const usePantry = create<PantryState>()(
  persist(
    (set, get) => ({
      items: [], logs: [], scanLogs: [], scanHistory: [], customRecipes: [], dirtyItems: [], dirtyLogs: [], lastSync: null, recipes: BUNDLED_RECIPES,

      addEntries: (entries) => {
        const now = Date.now();
        const created: PantryItem[] = entries.filter((e) => e.quantity > 0).map((e) => {
          const key = normalizeKey(e.classKey);
          const cat = getCatalogItem(key);
          const storage = e.storage ?? cat.default_storage;
          return { id: uid(), classKey: key, name: cat.display, emoji: cat.emoji, quantity: e.quantity, storage, addedAt: now,
            ...initialExpiry(key, storage, now), status: 'active', source: e.source ?? 'scan', scanId: e.scanId, updatedAt: now };
        });
        set((s) => ({ items: [...s.items, ...created], dirtyItems: [...s.dirtyItems, ...created.map((c) => c.id)] }));
      },

      setStorage: (id, storage) => {
        const now = Date.now();
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...changeStorage(i, storage, now), updatedAt: now } : i)),
          dirtyItems: [...s.dirtyItems, id],
        }));
      },

      closeItem: (id, status, qty) => {
        const now = Date.now();
        const s = get();
        const src = s.items.find((i) => i.id === id);
        if (!src || src.status !== 'active') return;
        const { next, dirty, units } = splitClose(s.items, id, status, qty ?? src.quantity, now);
        const logs = [...s.logs];
        const dl: string[] = [];
        if (status === 'consumed') {
          const grams = units * getCatalogItem(src.classKey).grams_per_item;
          const log: ConsumptionLog = { id: uid(), itemId: id, classKey: src.classKey, grams, kind: 'consumed', nutrients: nutrientsForGrams(src.classKey, grams), date: now };
          logs.push(log); dl.push(log.id);
        }
        set({ items: next, logs, dirtyItems: [...s.dirtyItems, ...dirty], dirtyLogs: [...s.dirtyLogs, ...dl] });
      },

      /** Cook: take ingredients from the soonest-expiring batches, log nutrition for the grams actually used. */
      cook: (recipe) => {
        const now = Date.now();
        let { items, logs, dirtyItems, dirtyLogs } = { ...get() };
        const used: string[] = [], short: string[] = [];
        for (const ing of recipe.ingredients) {
          const gpi = getCatalogItem(ing.key).grams_per_item;
          let need = ing.grams / gpi;
          const batches = items
            .filter((i) => i.status === 'active' && normalizeKey(i.classKey) === normalizeKey(ing.key))
            .sort((a, b) => a.expiresAt - b.expiresAt);
          if (!batches.length) { if (!ing.optional) short.push(ing.key); continue; }
          let takenUnits = 0;
          for (const b of batches) {
            if (need <= 1e-6) break;
            const take = Math.min(need, b.quantity);
            const r = splitClose(items, b.id, 'consumed', take, now);
            items = r.next; dirtyItems = [...dirtyItems, ...r.dirty]; need -= r.units; takenUnits += r.units;
          }
          const grams = takenUnits * gpi;
          const log: ConsumptionLog = { id: uid(), classKey: ing.key, grams, kind: 'recipe', nutrients: nutrientsForGrams(ing.key, grams), date: now };
          logs = [...logs, log]; dirtyLogs = [...dirtyLogs, log.id]; used.push(ing.key);
        }
        set({ items, logs, dirtyItems, dirtyLogs });
        return { used, short };
      },

      queueScanLog: (l) => set((s) => ({ scanLogs: [...s.scanLogs.filter((x) => x.clientScanId !== l.clientScanId), l].slice(-200) })),
      dropScanLogs: (ids) => set((s) => ({ scanLogs: s.scanLogs.filter((l) => !ids.includes(l.clientScanId)) })),
      addScanRecord: (record) => set((s) => ({ scanHistory: [record, ...(s.scanHistory || []).filter((x) => x.id !== record.id)].slice(0, 100) })),
      setScanHistory: (scanHistory) => set({ scanHistory }),
      addCustomRecipe: (r) => set((s) => ({ customRecipes: [r, ...(s.customRecipes || []).filter((x) => x.id !== r.id)] })),
      removeCustomRecipe: (id) => set((s) => ({ customRecipes: (s.customRecipes || []).filter((x) => x.id !== id) })),

      mergeServer: (incoming, serverTime) =>
        set((s) => {
          const byId = new Map(s.items.map((i) => [i.id, i]));
          for (const it of incoming) {
            const local = byId.get(it.id);
            if (!local || (it.updatedAt > local.updatedAt && !s.dirtyItems.includes(it.id))) byId.set(it.id, it);
          }
          return { items: [...byId.values()], lastSync: serverTime };
        }),

      // only clear rows that were not modified again while the request was in flight
      markSynced: (sent, logIds) =>
        set((s) => {
          const cur = new Map(s.items.map((i) => [i.id, i.updatedAt]));
          return { dirtyItems: s.dirtyItems.filter((id) => !(id in sent) || cur.get(id) !== sent[id]), dirtyLogs: s.dirtyLogs.filter((id) => !logIds.includes(id)) };
        }),

      setRecipes: (recipes) => set({ recipes }),
      reset: () => set({ items: [], logs: [], scanLogs: [], scanHistory: [], customRecipes: [], dirtyItems: [], dirtyLogs: [], lastSync: null }),
    }),
    { name: 'pantry-v1', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

export const activeItems = (items: PantryItem[]) => items.filter((i) => i.status === 'active' && !i.deleted && i.quantity > 1e-6);
export const fmtQty = (q: number) => (Math.abs(q - Math.round(q)) < 0.05 ? String(Math.round(q)) : q.toFixed(1));
