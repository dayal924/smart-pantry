import { Redirect } from 'expo-router';
import { useAuth } from '../store/authStore';

export default function Index() {
  const user = useAuth((s) => s.user);
  return <Redirect href={user ? '/(tabs)/scan' : '/(auth)/login'} />;
}
