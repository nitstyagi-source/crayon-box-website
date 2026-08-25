import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import {
  User,
  Shield,
  Fingerprint,
  Phone,
  LogOut,
  RefreshCw,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { PersonaBadge } from '../../components/PersonaBadge';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore } from '../../store/useAppStore';

export const ProfileScreen: React.FC = () => {
  const { userName, userEmail, userRole, logout, syncWithBackend, isSyncing } = useAppStore();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[Typography.h2, { color: '#FFFFFF' }]}>{userName}</Text>
              <Text style={[Typography.subtext, { color: '#94A3B8' }]}>{userEmail}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{userRole.toUpperCase()} ACCOUNT</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Switch Persona Hub */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>SWITCH ACTIVE ERP PERSONA</Text>
        <PersonaBadge />
      </View>

      {/* Security & Settings */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>SECURITY & PREFERENCES</Text>

        <GlassCard style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Fingerprint size={20} color={Colors.primaryLight} />
              <View style={styles.settingTextCol}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Biometric Quick Unlock</Text>
                <Text style={styles.settingSub}>FaceID / TouchID instant login</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#334155', true: Colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <RefreshCw size={20} color={Colors.accentCyan} />
              <View style={styles.settingTextCol}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Offline Sync Engine</Text>
                <Text style={styles.settingSub}>Auto-reconcile with PostgreSQL ERP</Text>
              </View>
            </View>
            <Switch
              value={offlineSyncEnabled}
              onValueChange={setOfflineSyncEnabled}
              trackColor={{ false: '#334155', true: Colors.success }}
            />
          </View>
        </GlassCard>
      </View>

      {/* Campus Emergency Hotline */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>CAMPUS SOS & HELPDESK</Text>
        <GlassCard style={styles.sosCard} accentBorderColor="rgba(239, 68, 68, 0.3)">
          <View style={styles.sosRow}>
            <Phone size={20} color={Colors.danger} />
            <View style={styles.sosInfo}>
              <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Principal & Security Desk</Text>
              <Text style={[Typography.subtext, { color: '#CBD5E1' }]}>+91 (0120) 4488-999 / Ext. 101</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert('Calling SOS', 'Dialing campus emergency desk...')}
              style={styles.sosBtn}
            >
              <Text style={styles.sosBtnText}>CALL</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>

      {/* Logout Action */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <ModernButton
          title="Sign Out of Session"
          variant="danger"
          onPress={logout}
          icon={<LogOut size={16} color="#FFFFFF" />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  profileCard: {
    padding: 18,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  roleTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  roleTagText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  sosCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 14,
  },
  sosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sosBtn: {
    backgroundColor: Colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sosBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
