import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon,
  accentColor = Colors.primary,
}) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[Typography.subtext, styles.label]}>{label}</Text>
        {icon && <View style={[styles.iconBox, { backgroundColor: `${accentColor}20` }]}>{icon}</View>}
      </View>
      
      <Text style={[Typography.h1, styles.value]}>{value}</Text>
      
      {change && (
        <View style={styles.changeRow}>
          <Text
            style={[
              Typography.caption,
              { color: isPositive ? Colors.success : Colors.danger },
            ]}
          >
            {isPositive ? '▲ ' : '▼ '}{change}
          </Text>
          <Text style={[Typography.caption, styles.subCaption]}> vs last month</Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    marginHorizontal: 4,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCaption: {
    color: '#64748B',
    fontSize: 10,
  },
});
