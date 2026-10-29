import { Platform } from 'react-native';
import { useAuth } from '../store/authStore';

const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

interface Opts { method?: string; json?: unknown; form?: FormData; auth?: boolean; timeoutMs?: number }

async function raw(path: string, o: Opts, token: string | null): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), o.timeoutMs ?? 15000);
  try {
    const headers: Record<string, string> = {};
    if (o.json !== undefined) headers['Content-Type'] = 'application/json';
    if (token && o.auth !== false) headers.Authorization = `Bearer ${token}`;
    return await fetch(API_URL + path, {
      method: o.method ?? (o.json || o.form ? 'POST' : 'GET'), headers, signal: ctl.signal,
      body: o.form ?? (o.json !== undefined ? JSON.stringify(o.json) : undefined),
    });
  } finally { clearTimeout(t); }
}

let refreshing: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  const { refresh, setTokens, logout } = useAuth.getState();
  if (!refresh) return false;
  refreshing ??= (async () => {
    try {
      const r = await raw('/auth/refresh', { json: { refresh_token: refresh }, auth: false }, null);
      if (!r.ok) { if (r.status === 401) await logout(); return false; }
      const d = await r.json();
      await setTokens(d.access_token, d.refresh_token);
      return true;
    } catch { return false; } finally { refreshing = null; }
  })();
  return refreshing;
}

export async function request<T>(path: string, o: Opts = {}): Promise<T> {
  let res = await raw(path, o, useAuth.getState().access);
  if (res.status === 401 && o.auth !== false && (await tryRefresh())) res = await raw(path, o, useAuth.getState().access);
  if (!res.ok) {
    let msg = res.statusText;
    try { const d = await res.json(); msg = typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail ?? d); } catch { /* ignore */ }
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---- typed endpoints -------------------------------------------------------------------
export interface TokenResponse { access_token: string; refresh_token: string; user: { id: string; email: string; name: string; role: string } }
export const api = {
  login: (email: string, password: string) => request<TokenResponse>('/auth/login', { json: { email, password }, auth: false }),
  register: (name: string, email: string, password: string) => request<TokenResponse>('/auth/register', { json: { name, email, password }, auth: false }),
  logScan: (body: unknown) => request<void>('/scans/log', { json: body }),
  sync: (body: unknown) => request<{ items: any[]; server_time: string }>('/inventory/sync', { json: body, timeoutMs: 25000 }),
  latestModel: () => request<any>('/models/latest'),
  copilot: (body: unknown) => request<{ reply: string; provider: string }>('/copilot/chat', { json: body, timeoutMs: 40000 }),
  recipes: () => request<any[]>('/recipes'),
  announcements: () => request<{ title: string; body: string; created_at: string }[]>('/announcements'),
  feedback: (body: unknown) => request<void>('/feedback', { json: body }),
  pushToken: (token: string, platform: string) => request<void>('/users/me/push-token', { method: 'PUT', json: { token, platform } }),
  waste: (days = 30) => request<any>(`/inventory/stats/waste?days=${days}`),
  scanHistory: (limit = 50) => request<any[]>(`/scans/history?limit=${limit}`),
};
