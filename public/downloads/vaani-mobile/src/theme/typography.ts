import { StyleSheet, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = StyleSheet.create({
  hero: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#F8FAFC',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#F8FAFC',
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#CBD5E1',
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: '#F8FAFC',
  },
  subtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#94A3B8',
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
