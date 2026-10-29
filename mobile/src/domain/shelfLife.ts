import { getCatalogItem, normalizeKey, Storage } from './catalog';

export const DAY = 86_400_000;
export type Urgency = 'fresh_later' | 'use_soon' | 'use_now' | 'expired';

export interface ExpiryFields {
  classKey: string;
  storage: Storage;
  anchorAt: number; // when the current storage mode started
  lifeUsed: number; // fraction of shelf life consumed BEFORE anchorAt (0..1)
  expiresAt: number;
}

export const shelfDays = (classKey: string, storage: Storage) => getCatalogItem(classKey).shelf_life_days[storage];

export function initialExpiry(classKey: string, storage: Storage, now: number): Pick<ExpiryFields, 'anchorAt' | 'lifeUsed' | 'expiresAt'> {
  return { anchorAt: now, lifeUsed: 0, expiresAt: now + shelfDays(classKey, storage) * DAY };
}

/**
 * Switch Room <-> Fridge. Life already used is carried over as a *fraction*, so an item that sat 3 days
 * on the counter and then goes in the fridge keeps its remaining fraction of the fridge shelf life.
 */
export function changeStorage<T extends ExpiryFields>(item: T, next: Storage, now: number): T {
  if (item.storage === next) return item;
  const oldDays = shelfDays(item.classKey, item.storage);
  const used = Math.min(1, item.lifeUsed + (now - item.anchorAt) / (oldDays * DAY));
  const newDays = shelfDays(item.classKey, next);
  return { ...item, storage: next, anchorAt: now, lifeUsed: used, expiresAt: now + (1 - used) * newDays * DAY };
}

export const daysLeft = (expiresAt: number, now: number) => Math.ceil((expiresAt - now) / DAY);

export function urgencyOf(expiresAt: number, now: number): Urgency {
  if (now > expiresAt) return 'expired';
  const d = daysLeft(expiresAt, now);
  return d <= 2 ? 'use_now' : d <= 5 ? 'use_soon' : 'fresh_later';
}

export const URGENCY_META: Record<Urgency, { label: string; emoji: string; color: string; bg: string }> = {
  fresh_later: { label: 'Fresh later', emoji: '🟢', color: '#1B5E20', bg: '#E8F5E9' },
  use_soon: { label: 'Use soon', emoji: '🟡', color: '#7A5B00', bg: '#FFF8E1' },
  use_now: { label: 'Use now', emoji: '🟠', color: '#A04100', bg: '#FFF0E0' },
  expired: { label: 'Expired', emoji: '🔴', color: '#B71C1C', bg: '#FDECEA' },
};
export const URGENCY_ORDER: Urgency[] = ['expired', 'use_now', 'use_soon', 'fresh_later'];
export { normalizeKey };
