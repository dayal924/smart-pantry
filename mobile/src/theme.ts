import { Platform, ViewStyle } from 'react-native';

export const C = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primarySoft: '#E8F5E9',
  primaryMuted: '#C8E6C9',
  bg: '#F5F7F3',
  card: '#FFFFFF',
  cardAlt: '#F9FAF8',
  text: '#1B1F1A',
  textSecondary: '#4A5546',
  muted: '#6B7568',
  border: '#E1E7DD',
  borderLight: '#EDF1EA',
  danger: '#C62828',
  dangerSoft: '#FFEBEE',
  warn: '#EF6C00',
  warnSoft: '#FFF3E0',
  info: '#1565C0',
  infoSoft: '#E3F2FD',
};

export const R = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
};

export const S: { card: ViewStyle; float: ViewStyle } = {
  card: Platform.select({
    ios: {
      shadowColor: '#0F1A0F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};
