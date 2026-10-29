import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, S } from '../theme';

export type ScreenEdge = 'top' | 'bottom' | 'left' | 'right';

export function Screen({
  children,
  style,
  edges = ['top', 'left', 'right'],
  noTopBuffer = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ScreenEdge[];
  noTopBuffer?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const topInset = edges.includes('top')
    ? Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 20) + (noTopBuffer ? 0 : 4)
    : 0;
  const bottomInset = edges.includes('bottom') ? Math.max(insets.bottom, 12) : 0;
  const leftInset = edges.includes('left') ? insets.left : 0;
  const rightInset = edges.includes('right') ? insets.right : 0;

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: C.bg,
          paddingTop: topInset,
          paddingBottom: bottomInset,
          paddingLeft: leftInset,
          paddingRight: rightInset,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.7, backgroundColor: C.borderLight },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {rightAction && <View style={styles.headerRight}>{rightAction}</View>}
      </View>
      {subtitle && (
        typeof subtitle === 'string' ? (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        ) : (
          subtitle
        )
      )}
    </View>
  );
}

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.4 }}>
    {children}
  </Text>
);

export const Muted = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <Text style={[{ color: C.muted, fontSize: 13, lineHeight: 18 }, style]}>{children}</Text>
);

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <View
    style={[
      {
        backgroundColor: C.card,
        borderRadius: R.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
      },
      S.card,
      style,
    ]}
  >
    {children}
  </View>
);

export function Btn({
  title,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger' | 'soft';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const bg =
    kind === 'primary'
      ? C.primary
      : kind === 'danger'
      ? C.danger
      : kind === 'soft'
      ? C.primarySoft
      : 'transparent';
  const fg =
    kind === 'primary' || kind === 'danger'
      ? '#FFFFFF'
      : kind === 'soft'
      ? C.primaryDark
      : C.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: R.md,
          minHeight: 46,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          borderWidth: kind === 'ghost' ? 1.2 : 0,
          borderColor: kind === 'ghost' ? C.border : 'transparent',
          flexDirection: 'row',
          gap: 8,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={{ color: fg, fontWeight: '700', fontSize: 15, letterSpacing: -0.2 }}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export const Chip = ({
  label,
  active,
  onPress,
  color,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 13,
      borderRadius: R.full,
      borderWidth: 1,
      borderColor: active ? color ?? C.primary : C.border,
      backgroundColor: active ? (color ?? C.primary) : '#FFFFFF',
      opacity: pressed ? 0.85 : 1,
    })}
  >
    {icon && (
      <Ionicons
        name={icon}
        size={14}
        color={active ? '#FFFFFF' : C.textSecondary}
      />
    )}
    <Text
      style={{
        color: active ? '#FFFFFF' : C.text,
        fontSize: 13,
        fontWeight: '600',
      }}
    >
      {label}
    </Text>
  </Pressable>
);

export const Field = ({ label, ...p }: TextInputProps & { label: string }) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{label}</Text>
    <TextInput
      placeholderTextColor="#9AA597"
      autoCapitalize="none"
      {...p}
      style={{
        borderWidth: 1.2,
        borderColor: C.border,
        backgroundColor: '#FFFFFF',
        borderRadius: R.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: C.text,
      }}
    />
  </View>
);

export const Stepper = ({
  value,
  onChange,
  step,
  min,
  max,
  fmt,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  fmt?: (v: number) => string;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Pressable
      onPress={() => onChange(Math.max(min, +(value - step).toFixed(3)))}
      hitSlop={6}
      style={({ pressed }) => [
        sb.btn,
        pressed && { opacity: 0.75, backgroundColor: C.primaryMuted },
      ]}
    >
      <Text style={sb.t}>−</Text>
    </Pressable>
    <View style={sb.valBox}>
      <Text style={{ textAlign: 'center', fontWeight: '800', color: C.text, fontSize: 15 }}>
        {fmt ? fmt(value) : value}
      </Text>
    </View>
    <Pressable
      onPress={() => onChange(Math.min(max, +(value + step).toFixed(3)))}
      hitSlop={6}
      style={({ pressed }) => [
        sb.btn,
        pressed && { opacity: 0.75, backgroundColor: C.primaryMuted },
      ]}
    >
      <Text style={sb.t}>+</Text>
    </Pressable>
  </View>
);

const sb = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  t: { fontSize: 20, color: C.primaryDark, fontWeight: '700', lineHeight: 22 },
  valBox: { minWidth: 50, alignItems: 'center', justifyContent: 'center' },
});

export const Bar = ({
  pct,
  color = C.primary,
  height = 8,
}: {
  pct: number;
  color?: string;
  height?: number;
}) => (
  <View
    style={{
      height,
      borderRadius: height / 2,
      backgroundColor: '#E8EDE5',
      overflow: 'hidden',
    }}
  >
    <View
      style={{
        width: `${Math.min(100, Math.max(0, pct))}%`,
        height,
        borderRadius: height / 2,
        backgroundColor: pct > 100 ? C.warn : color,
      }}
    />
  </View>
);

export function EmptyState({
  emoji,
  title,
  subtitle,
  actionTitle,
  onAction,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
}) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, gap: 10 }}>
      <Text style={{ fontSize: 44, marginBottom: 4 }}>{emoji}</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, textAlign: 'center' }}>
        {title}
      </Text>
      <Muted style={{ textAlign: 'center', maxWidth: 280 }}>{subtitle}</Muted>
      {actionTitle && onAction && (
        <Btn title={actionTitle} onPress={onAction} kind="soft" style={{ marginTop: 8 }} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
