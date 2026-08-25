import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | any;
  highlight?: boolean;
  variant?: 'default' | 'glow' | 'accent';
  accentBorderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  highlight = false,
  variant,
  accentBorderColor,
}) => {
  const isGlow = variant === 'glow' || highlight;

  return (
    <View
      style={[
        styles.base,
        isGlow && styles.highlight,
        accentBorderColor ? { borderColor: accentBorderColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 5,
  },
  highlight: {
    backgroundColor: 'rgba(99, 102, 241, 0.09)',
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
});
