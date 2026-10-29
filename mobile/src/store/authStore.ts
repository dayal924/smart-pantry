import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

export interface User { id: string; email: string; name: string; role: string }
interface AuthState {
  user: User | null; access: string | null; refresh: string | null; hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: User, access: string, refresh: string) => Promise<void>;
  setTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
}
const K = 'pantry.session.v1';

export const useAuth = create<AuthState>((set, get) => ({
  user: null, access: null, refresh: null, hydrated: false,
  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(K);
      if (raw) { const s = JSON.parse(raw); set({ user: s.user, access: s.access, refresh: s.refresh }); }
    } catch { /* corrupted -> logged out */ }
    set({ hydrated: true });
  },
  setSession: async (user, access, refresh) => {
    set({ user, access, refresh });
    await SecureStore.setItemAsync(K, JSON.stringify({ user, access, refresh }));
  },
  setTokens: async (access, refresh) => {
    set({ access, refresh });
    await SecureStore.setItemAsync(K, JSON.stringify({ user: get().user, access, refresh }));
  },
  logout: async () => { set({ user: null, access: null, refresh: null }); await SecureStore.deleteItemAsync(K); },
}));
