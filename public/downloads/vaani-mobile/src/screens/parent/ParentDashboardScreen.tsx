import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Video,
  Navigation,
  CreditCard,
  BookOpen,
  Award,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ChildSwitcher } from '../../components/ChildSwitcher';
import { LiveIndicator } from '../../components/LiveIndicator';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  navigation: any;
}

export const ParentDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { children, activeChildId, invoices, busData } = useAppStore();
  const currentChild = children.find(c => c.id === activeChildId) || children[0];

  const pendingInvoice = invoices.find(inv => inv.status !== 'PAID');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Student Selector */}
      <ChildSwitcher />

      {/* Hero Overview Card */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[Typography.caption, { color: Colors.primaryLight }]}>
                ACADEMIC YEAR 2026 - 2027
              </Text>
              <Text style={[Typography.h2, { color: '#FFFFFF', marginTop: 2 }]}>
                {currentChild.name}
              </Text>
              <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
                {currentChild.house} • Roll #{currentChild.rollNo}
              </Text>
            </View>
            <View style={styles.attendanceBadge}>
              <Text style={styles.attendanceVal}>{currentChild.attendancePercent}%</Text>
              <Text style={styles.attendanceLabel}>Attendance</Text>
            </View>
          </View>

          {/* Quick Telemetry Banner */}
          <View style={styles.telemetryBar}>
            <View style={styles.telemetryItem}>
              <Navigation size={14} color={Colors.success} />
              <Text style={styles.telemetryText}>
                {busData.busNumber.split(' ')[0]} {busData.busNumber.split(' ')[1]}: {busData.etaMinutes}m ETA
              </Text>
            </View>
            <View style={styles.dividerDot} />
            <View style={styles.telemetryItem}>
              <ShieldCheck size={14} color={Colors.accentCyan} />
              <Text style={styles.telemetryText}>Campus Secure</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Urgent Fee Banner if Pending */}
      {pendingInvoice && (
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Fees')}
          >
            <GlassCard style={styles.feeBanner} accentBorderColor="rgba(245, 158, 11, 0.4)">
              <View style={styles.feeBannerRow}>
                <View style={styles.feeIconBox}>
                  <CreditCard size={20} color={Colors.warning} />
                </View>
                <View style={styles.feeInfoCol}>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
                    {pendingInvoice.term} Fee Due
                  </Text>
                  <Text style={[Typography.subtext, { color: '#CBD5E1' }]}>
                    ₹{pendingInvoice.amount.toLocaleString()} • Due by {pendingInvoice.dueDate}
                  </Text>
                </View>
                <View style={styles.payNowBtn}>
                  <Text style={styles.payNowText}>Pay Now</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>
      )}

      {/* Primary Mobile Action Grid */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>LIVE STUDENT SERVICES</Text>

        <View style={styles.grid}>
          {/* Live CCTV Hub */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LiveCctv')}
            style={styles.gridCardWrapper}
          >
            <GlassCard style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Video size={20} color={Colors.danger} />
                </View>
                <LiveIndicator size="sm" label="LIVE" />
              </View>
              <Text style={[Typography.h3, styles.cardTitle]}>Classroom CCTV</Text>
              <Text style={[Typography.subtext, styles.cardSub]}>
                Stream 16 campus cameras & {currentChild.grade} feed
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* GPS Bus Tracker */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BusTracker')}
            style={styles.gridCardWrapper}
          >
            <GlassCard style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Navigation size={20} color={Colors.success} />
                </View>
                <LiveIndicator size="sm" label="MOVING" color={Colors.success} />
              </View>
              <Text style={[Typography.h3, styles.cardTitle]}>Bus Live GPS</Text>
              <Text style={[Typography.subtext, styles.cardSub]}>
                Route 12 • ETA {busData.etaMinutes} mins to your stop
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Digital Diary */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DigitalDiary')}
            style={styles.gridCardWrapper}
          >
            <GlassCard style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <BookOpen size={20} color={Colors.primary} />
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>2 Pending</Text>
                </View>
              </View>
              <Text style={[Typography.h3, styles.cardTitle]}>Digital Diary</Text>
              <Text style={[Typography.subtext, styles.cardSub]}>
                Homework, notes & classwork updates
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Report Card & Analytics */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ReportCard')}
            style={styles.gridCardWrapper}
          >
            <GlassCard style={styles.gridCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Award size={20} color={Colors.secondary} />
                </View>
                <View style={[styles.badgePill, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Text style={[styles.badgeText, { color: Colors.secondary }]}>Rank #2</Text>
                </View>
              </View>
              <Text style={[Typography.h3, styles.cardTitle]}>Report Cards</Text>
              <Text style={[Typography.subtext, styles.cardSub]}>
                Term 1 Grade A+ (94.2% GPA)
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming School Events */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>UPCOMING CAMPUS EVENTS</Text>

        <GlassCard style={styles.eventCard}>
          <View style={styles.eventRow}>
            <View style={styles.eventDateBox}>
              <Text style={styles.eventDay}>26</Text>
              <Text style={styles.eventMonth}>AUG</Text>
            </View>
            <View style={styles.eventInfoCol}>
              <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
                Annual STEAM & Science Exhibition
              </Text>
              <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
                09:30 AM - 02:00 PM • Aryabhata Auditorium
              </Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
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
    marginVertical: 8,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  heroCard: {
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  attendanceVal: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '800',
  },
  attendanceLabel: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telemetryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginHorizontal: 10,
  },
  feeBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 14,
  },
  feeBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  feeInfoCol: {
    flex: 1,
  },
  payNowBtn: {
    backgroundColor: Colors.warning,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  payNowText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCardWrapper: {
    width: '48%',
  },
  gridCard: {
    padding: 16,
    height: 145,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  cardSub: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  eventCard: {
    padding: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventDay: {
    color: Colors.primaryLight,
    fontSize: 16,
    fontWeight: '800',
  },
  eventMonth: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  eventInfoCol: {
    flex: 1,
  },
});
