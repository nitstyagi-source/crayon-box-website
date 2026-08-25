import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  TrendingUp,
  Users,
  Navigation,
  Video,
  CheckSquare,
  Megaphone,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { StatCard } from '../../components/StatCard';
import { LiveIndicator } from '../../components/LiveIndicator';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { approvals } = useAppStore();
  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;

  const handleBroadcast = () => {
    Alert.alert(
      'Emergency Campus Broadcast',
      'Select broadcast channel: (1) All Parents (2) All Faculty (3) Bus Drivers',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Notice', onPress: () => Alert.alert('Broadcast Sent', 'Push notification broadcast dispatched.') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* School-wide KPI Summary */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>CAMPUS EXECUTIVE METRICS</Text>
        <View style={styles.statGrid}>
          <StatCard
            label="Total Fees Collected"
            value="₹34.80L"
            change="12.4%"
            isPositive={true}
            icon={<TrendingUp size={18} color={Colors.success} />}
            accentColor={Colors.success}
          />
          <StatCard
            label="Student Attendance"
            value="96.2%"
            change="1.8%"
            isPositive={true}
            icon={<Users size={18} color={Colors.primaryLight} />}
            accentColor={Colors.primary}
          />
        </View>

        <View style={styles.statGrid}>
          <StatCard
            label="Staff On Duty"
            value="98.5%"
            icon={<ShieldCheck size={18} color={Colors.accentCyan} />}
            accentColor={Colors.accentCyan}
          />
          <StatCard
            label="Active Bus Fleet"
            value="8 / 8 Buses"
            icon={<Navigation size={18} color={Colors.success} />}
            accentColor={Colors.success}
          />
        </View>
      </View>

      {/* Pending Approvals Hub Banner */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Approvals')}
        >
          <GlassCard style={styles.approvalBanner} accentBorderColor="rgba(245, 158, 11, 0.4)">
            <View style={styles.approvalRow}>
              <View style={styles.approvalIconBox}>
                <CheckSquare size={22} color={Colors.warning} />
              </View>
              <View style={styles.approvalInfo}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF', fontSize: 16 }]}>
                  Executive Approvals Desk
                </Text>
                <Text style={[Typography.subtext, { color: '#CBD5E1' }]}>
                  {pendingApprovalsCount} pending requests (Leaves, Concessions, Expenses)
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingApprovalsCount} New</Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Quick Admin Actions */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>EXECUTIVE ACTIONS</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LiveCctv')}
            style={styles.actionCol}
          >
            <GlassCard style={styles.actionCard}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Video size={20} color={Colors.danger} />
              </View>
              <Text style={[Typography.bodyBold, styles.actionTitle]}>Live CCTV Grid</Text>
              <Text style={styles.actionSub}>16 feeds online</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBroadcast}
            style={styles.actionCol}
          >
            <GlassCard style={styles.actionCard}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Megaphone size={20} color={Colors.secondary} />
              </View>
              <Text style={[Typography.bodyBold, styles.actionTitle]}>Push Broadcast</Text>
              <Text style={styles.actionSub}>Campus Circulars</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>

      {/* Admissions Pipeline Overview */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>ADMISSIONS PIPELINE (2026-27)</Text>
        <GlassCard style={styles.admissionsCard}>
          <View style={styles.admissionsRow}>
            <View style={styles.admissionsItem}>
              <Text style={styles.admCount}>42</Text>
              <Text style={styles.admLabel}>New Inquiries</Text>
            </View>
            <View style={styles.admissionsDivider} />
            <View style={styles.admissionsItem}>
              <Text style={[styles.admCount, { color: Colors.primaryLight }]}>18</Text>
              <Text style={styles.admLabel}>Under Review</Text>
            </View>
            <View style={styles.admissionsDivider} />
            <View style={styles.admissionsItem}>
              <Text style={[styles.admCount, { color: Colors.success }]}>24</Text>
              <Text style={styles.admLabel}>Enrolled</Text>
            </View>
          </View>
        </GlassCard>
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
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  statGrid: {
    flexDirection: 'row',
  },
  approvalBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 16,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  approvalInfo: {
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCol: {
    flex: 1,
  },
  actionCard: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  actionSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  admissionsCard: {
    padding: 16,
  },
  admissionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  admissionsItem: {
    alignItems: 'center',
  },
  admissionsDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  admCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  admLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
