import { api } from './api';
import { isOnline } from './network';
import { useAuth } from '../store/authStore';
import { ConsumptionLog, PantryItem, usePantry } from '../store/pantryStore';

const iso = (ms: number) => new Date(ms).toISOString();
const ms = (s: string) => new Date(s).getTime();

const itemToWire = (i: PantryItem) => ({
  id: i.id, class_key: i.classKey, name: i.name, emoji: i.emoji, quantity: i.quantity, storage: i.storage, added_at: iso(i.addedAt),
  anchor_at: iso(i.anchorAt), life_used: i.lifeUsed, expires_at: iso(i.expiresAt), status: i.status, closed_at: i.closedAt ? iso(i.closedAt) : null,
  source: i.source, scan_id: i.scanId ?? null, updated_at: iso(i.updatedAt), deleted: !!i.deleted,
});
const itemFromWire = (w: any): PantryItem => ({
  id: w.id, classKey: w.class_key, name: w.name, emoji: w.emoji ?? '🥗', quantity: w.quantity, storage: w.storage, addedAt: ms(w.added_at),
  anchorAt: ms(w.anchor_at), lifeUsed: w.life_used, expiresAt: ms(w.expires_at), status: w.status, closedAt: w.closed_at ? ms(w.closed_at) : undefined,
  source: w.source, scanId: w.scan_id ?? undefined, updatedAt: ms(w.updated_at), deleted: w.deleted,
});
const logToWire = (l: ConsumptionLog) => ({ id: l.id, item_id: l.itemId ?? null, class_key: l.classKey, grams: l.grams, kind: l.kind, nutrients: l.nutrients, date: iso(l.date) });

let running = false;
export interface SyncResult { ok: boolean; pushed: number; pulled: number; error?: string }

/** Push dirty rows, pull remote changes, flush queued scan telemetry. Safe to call any time; no-ops offline. */
export async function syncNow(): Promise<SyncResult> {
  if (running) return { ok: true, pushed: 0, pulled: 0 };
  if (!useAuth.getState().user || !(await isOnline())) return { ok: false, pushed: 0, pulled: 0, error: 'offline' };
  running = true;
  try {
    const st = usePantry.getState();
    const dirty = st.items.filter((i) => st.dirtyItems.includes(i.id));
    const logs = st.logs.filter((l) => st.dirtyLogs.includes(l.id));
    const res = await api.sync({ since: st.lastSync, items: dirty.map(itemToWire), logs: logs.map(logToWire) });
    const sent = Object.fromEntries(dirty.map((i) => [i.id, i.updatedAt]));
    usePantry.getState().markSynced(sent, logs.map((l) => l.id));
    usePantry.getState().mergeServer(res.items.map(itemFromWire), res.server_time);
    const done: string[] = [];
    for (const q of usePantry.getState().scanLogs) {
      try { await api.logScan(q.payload); done.push(q.clientScanId); } catch { break; }
    }
    if (done.length) usePantry.getState().dropScanLogs(done);
    return { ok: true, pushed: dirty.length, pulled: res.items.length };
  } catch (e: any) {
    return { ok: false, pushed: 0, pulled: 0, error: e?.message ?? String(e) };
  } finally { running = false; }
}

/** Refresh the recipe list from the server when online (the bundled list works offline). */
export async function refreshRecipes() {
  try { if (await isOnline()) usePantry.getState().setRecipes(await api.recipes()); } catch { /* keep cache */ }
}
