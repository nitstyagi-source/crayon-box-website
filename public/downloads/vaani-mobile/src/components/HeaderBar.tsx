import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Bell, RefreshCw } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';

interface HeaderBarProps {
  onNotificationPress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onNotificationPress }) => {
  const { userName, userRole, isSyncing, lastSyncedTimestamp, syncWithBackend } = useAppStore();

  const getPersonaColor = () => {
    switch (userRole) {
      case 'Faculty':
        return '#06B6D4';
      case 'Admin':
        return '#F59E0B';
      case 'Student':
        return '#EC4899';
      case 'Driver':
        return '#10B981';
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandingCol}>
          <Text style={styles.schoolTag}>VAANI • CRAYON BOX ERP</Text>
          <Text style={[Typography.h2, styles.greeting]}>
            Hello, {userName.split(' ')[0]} 👋
          </Text>
        </View>

        <View style={styles.actionRow}>
          {/* Sync Trigger */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={syncWithBackend}
            style={styles.iconButton}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={Colors.primaryLight} />
            ) : (
              <RefreshCw size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationPress}
            style={styles.iconButton}
          >
            <Bell size={20} color="#F8FAFC" />
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Status Bar */}
      <View style={styles.syncBar}>
        <View style={[styles.personaPill, { borderColor: `${getPersonaColor()}50` }]}>
          <View style={[styles.roleDot, { backgroundColor: getPersonaColor() }]} />
          <Text style={[styles.roleText, { color: getPersonaColor() }]}>
            {userRole.toUpperCase()} DESK
          </Text>
        </View>
        <Text style={styles.syncText}>
          {isSyncing ? 'Syncing with ERP...' : `Synced ${lastSyncedTimestamp}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(9, 13, 22, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandingCol: {
    flex: 1,
  },
  schoolTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#818CF8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  greeting: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  personaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncText: {
    fontSize: 11,
    color: '#64748B',
  },
});
