import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const GlassStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 18,
  },
  cardHighlight: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 18,
  },
  header: {
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dock: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
});
