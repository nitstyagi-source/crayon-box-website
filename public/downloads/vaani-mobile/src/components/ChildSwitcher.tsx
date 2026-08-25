import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';

export const ChildSwitcher: React.FC = () => {
  const { children, activeChildId, setActiveChild } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={[Typography.caption, styles.heading]}>SELECT STUDENT PROFILE</Text>
      <View style={styles.row}>
        {children.map(child => {
          const isSelected = activeChildId === child.id;
          return (
            <TouchableOpacity
              key={child.id}
              activeOpacity={0.8}
              onPress={() => setActiveChild(child.id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >
              <View style={styles.avatarBox}>
                <Text style={styles.avatar}>{child.avatar}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={[Typography.bodyBold, styles.name, isSelected && styles.nameSelected]}>
                  {child.name}
                </Text>
                <Text style={styles.gradeText}>
                  {child.grade} • Sec {child.section} • Roll #{child.rollNo}
                </Text>
              </View>
              {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  heading: {
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  nameSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gradeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginLeft: 4,
  },
});
