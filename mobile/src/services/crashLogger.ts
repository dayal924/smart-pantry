import AsyncStorage from '@react-native-async-storage/async-storage';

const CRASH_KEY = '@smart_pantry_last_crash';

export interface CrashInfo {
  timestamp: string;
  message: string;
  stack?: string;
  isFatal: boolean;
}

export async function saveCrash(error: any, isFatal = false) {
  try {
    const info: CrashInfo = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack,
      isFatal,
    };
    await AsyncStorage.setItem(CRASH_KEY, JSON.stringify(info));
    console.error('[SmartPantry Crash]', info);
  } catch {}
}

export async function getLastCrash(): Promise<CrashInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(CRASH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearLastCrash() {
  try {
    await AsyncStorage.removeItem(CRASH_KEY);
  } catch {}
}

export function initGlobalCrashHandler() {
  const globalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  (global as any).ErrorUtils?.setGlobalHandler?.((error: any, isFatal?: boolean) => {
    saveCrash(error, !!isFatal);
    if (globalHandler) {
      globalHandler(error, isFatal);
    }
  });
}

