import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Muted, Screen } from '../../components/ui';
import { scanPhoto } from '../../ml/scanner';
import { useModel } from '../../store/modelStore';
import { useScan } from '../../store/scanStore';
import { useSettings } from '../../store/settingsStore';
import { C, R } from '../../theme';

export default function ScanTab() {
  const router = useRouter();
  const cam = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [perm, requestPerm] = useCameraPermissions();
  const { busy, setBusy, setResult } = useScan();
  const model = useModel();
  const net = useNetInfo();
  const offline = net.isConnected === false;

  const topSafe =
    Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 20) + 8;

  const run = async (uri: string) => {
    setBusy(true);
    try {
      const r = await scanPhoto(uri);
      setResult(r);
      router.push('/review');
    } catch (e: any) {
      Alert.alert('Scan failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const shoot = async () => {
    if (busy || !cam.current) return;
    try {
      const p = await cam.current.takePictureAsync({ quality: 0.9, exif: false });
      if (p?.uri) run(p.uri);
    } catch (e: any) {
      Alert.alert('Capture error', e?.message ?? 'Could not take photo');
    }
  };

  const pick = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });
      if (!r.canceled && r.assets[0]) run(r.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Picker error', e?.message ?? 'Could not open image library');
    }
  };

  if (!perm) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!perm.granted) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={styles.permContainer}>
          <View style={styles.permIconCircle}>
            <Ionicons name="camera" size={40} color={C.primary} />
          </View>
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Muted style={{ textAlign: 'center', maxWidth: 290 }}>
            Scanning runs entirely on your phone via the on-device AI model. Photos are not uploaded.
          </Muted>
          <View style={{ width: '100%', gap: 12, marginTop: 12 }}>
            <Btn title="Allow camera access" onPress={requestPerm} />
            <Btn kind="ghost" title="Pick from photo library" onPress={pick} icon="images-outline" />
          </View>
        </View>
      </Screen>
    );
  }

  const ready = model.status === 'ready';

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />

      {/* Top status bar badges - safe from notch and dynamic island */}
      <View
        pointerEvents="box-none"
        style={[
          styles.topHud,
          {
            top: topSafe,
            left: Math.max(insets.left, 16),
            right: Math.max(insets.right, 16),
          },
        ]}
      >
        <Pill
          icon={ready ? 'hardware-chip' : 'hourglass'}
          text={
            ready
              ? `On-device · ${model.info?.version} · ${model.info?.provider}`
              : model.status === 'error'
              ? 'Model error'
              : 'Loading model…'
          }
          ok={ready}
        />
        <Pill
          icon={offline ? 'cloud-offline' : 'cloud-done'}
          text={offline ? 'Offline ready' : 'Online'}
          ok={!offline}
        />
      </View>

      {/* Model error overlay */}
      {model.status === 'error' && (
        <View
          style={[
            styles.errorCard,
            {
              top: topSafe + 58,
              left: Math.max(insets.left, 16),
              right: Math.max(insets.right, 16),
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color={C.danger} />
            <Text style={{ color: C.danger, fontWeight: '800', fontSize: 15 }}>
              On-device model failed to load
            </Text>
          </View>
          <Muted style={{ marginTop: 4 }}>{model.error}</Muted>
          <Btn
            kind="soft"
            title="Retry loading model"
            onPress={() => model.load(useSettings.getState().accel, true)}
            style={{ marginTop: 10 }}
          />
        </View>
      )}

      {/* Camera Viewfinder Guide */}
      <View pointerEvents="none" style={styles.viewfinderContainer}>
        <View style={styles.viewfinderBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.viewfinderHint}>Point camera at fresh produce</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <Pressable
          onPress={pick}
          hitSlop={8}
          style={({ pressed }) => [
            styles.sideBtn,
            pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
          ]}
        >
          <Ionicons name="images" size={24} color="#FFFFFF" />
          <Text style={styles.sideBtnText}>Photos</Text>
        </Pressable>

        <Pressable
          onPress={shoot}
          disabled={busy}
          style={({ pressed }) => [
            styles.shutter,
            busy && { opacity: 0.5 },
            pressed && !busy && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/scans')}
          hitSlop={8}
          style={({ pressed }) => [
            styles.sideBtn,
            pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
          ]}
        >
          <Ionicons name="time" size={24} color="#FFFFFF" />
          <Text style={styles.sideBtnText}>History</Text>
        </Pressable>
      </View>

      {/* Processing HUD */}
      {busy && (
        <View style={styles.busyOverlay}>
          <View style={styles.busyCard}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.busyTitle}>Detecting produce…</Text>
            <Muted style={{ textAlign: 'center' }}>
              Running on-device neural network
            </Muted>
          </View>
        </View>
      )}
    </View>
  );
}

const Pill = ({ icon, text, ok }: { icon: any; text: string; ok: boolean }) => (
  <View style={styles.pillContainer}>
    <Ionicons name={icon} size={14} color={ok ? '#81C784' : '#FFB74D'} />
    <Text style={styles.pillText} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  permContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  permIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
  },
  topHud: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    zIndex: 10,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(18, 24, 18, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: R.lg,
    zIndex: 11,
    borderWidth: 1,
    borderColor: C.danger,
  },
  viewfinderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: '74%',
    aspectRatio: 1,
    maxWidth: 320,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },
  viewfinderHint: {
    marginTop: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: R.full,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sideBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(20, 24, 20, 0.65)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sideBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sideBtnPlaceholder: {
    width: 62,
    height: 62,
  },
  shutter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: 24,
  },
  busyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: R.xl,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    width: '84%',
    maxWidth: 320,
  },
  busyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
});
