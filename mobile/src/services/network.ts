import NetInfo from '@react-native-community/netinfo';

export async function isOnline(): Promise<boolean> {
  try {
    const s = await NetInfo.fetch();
    return !!s.isConnected && s.isInternetReachable !== false;
  } catch {
    return false;
  }
}
