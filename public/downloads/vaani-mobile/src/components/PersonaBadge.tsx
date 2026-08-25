import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useAppStore, UserRole } from '../store/useAppStore';

const ROLES: { role: UserRole; label: string; icon: string }[] = [
  { role: 'Parent', label: 'Parent Hub', icon: '👨‍👩‍👧' },
  { role: 'Faculty', label: 'Teacher Desk', icon: '👩‍🏫' },
  { role: 'Admin', label: 'Admin & Principal', icon: '👑' },
  { role: 'Student', label: 'Student Portal', icon: '🎓' },
];

export const PersonaBadge: React.FC = () => {
  const { userRole, setRole } = useAppStore();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {ROLES.map(item => {
          const isActive = userRole === item.role;
          return (
            <TouchableOpacity
              key={item.role}
              activeOpacity={0.8}
              onPress={() => setRole(item.role)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text
                style={[
                  Typography.badge,
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: '#94A3B8',
  },
});
