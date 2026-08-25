import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Users,
  PlusCircle,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { LiveIndicator } from '../../components/LiveIndicator';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  navigation: any;
}

export const FacultyDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const {
    userName,
    isClockedIn,
    clockInTime,
    geofenceVerified,
    geofenceDistanceMeters,
    clockInGeofence,
    clockOutGeofence,
    timetable,
  } = useAppStore();

  const [loadingClock, setLoadingClock] = useState(false);

  const handleClockToggle = async () => {
    setLoadingClock(true);
    if (isClockedIn) {
      clockOutGeofence();
      Alert.alert('Clocked Out', 'Shift logged successfully.');
    } else {
      await clockInGeofence();
      Alert.alert('Clock-In Verified', 'Geofence validated within 38m of Main Academic Block.');
    }
    setLoadingClock(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Geofence Radar Card */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.radarCard}>
          <View style={styles.radarHeader}>
            <View style={styles.geofencePill}>
              <MapPin size={14} color={Colors.accentCyan} />
              <Text style={styles.geofenceText}>
                Campus Radar: {geofenceDistanceMeters}m from School Center
              </Text>
            </View>
            <LiveIndicator
              label={isClockedIn ? 'ON DUTY' : 'OFF DUTY'}
              color={isClockedIn ? Colors.success : Colors.warning}
              size="sm"
            />
          </View>

          <Text style={[Typography.h2, { color: '#FFFFFF', marginTop: 12 }]}>
            {isClockedIn ? `Clocked In at ${clockInTime}` : 'Not Clocked In'}
          </Text>
          <Text style={[Typography.subtext, { color: '#94A3B8', marginTop: 2 }]}>
            Geofence requirement: {'<'} 250m radius • Bio-GPS Verified
          </Text>

          <ModernButton
            title={isClockedIn ? 'Clock Out Shift' : '1-Tap Geofence Clock-In'}
            variant={isClockedIn ? 'outline' : 'primary'}
            loading={loadingClock}
            onPress={handleClockToggle}
            style={{ marginTop: 16 }}
          />
        </GlassCard>
      </View>

      {/* Teacher Quick Actions */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>FACULTY ACTION DESK</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AttendanceRegister')}
            style={styles.actionCardWrapper}
          >
            <GlassCard style={styles.actionCard}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <Users size={22} color={Colors.accentCyan} />
              </View>
              <Text style={[Typography.bodyBold, styles.actionTitle]}>
                Mark Class Attendance
              </Text>
              <Text style={styles.actionSub}>Grade 4-B Roster</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HomeworkPublisher')}
            style={styles.actionCardWrapper}
          >
            <GlassCard style={styles.actionCard}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <BookOpen size={22} color={Colors.primaryLight} />
              </View>
              <Text style={[Typography.bodyBold, styles.actionTitle]}>
                + Publish Homework
              </Text>
              <Text style={styles.actionSub}>Push to Diaries</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Teaching Schedule */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>TODAY'S TEACHING PERIODS</Text>

        {timetable.slice(0, 4).map(item => (
          <GlassCard key={item.period} style={styles.periodCard}>
            <View style={styles.periodRow}>
              <View style={[styles.periodNumberBox, item.isCurrent && styles.currentPeriodBox]}>
                <Text style={[styles.periodNumText, item.isCurrent && { color: Colors.primaryLight }]}>
                  {item.period === 'Break' ? '☕' : `P${item.period}`}
                </Text>
              </View>
              <View style={styles.periodDetails}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>{item.subject}</Text>
                <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
                  {item.time} • {item.room}
                </Text>
              </View>
              {item.isCurrent && (
                <View style={styles.nowBadge}>
                  <Text style={styles.nowText}>NOW</Text>
                </View>
              )}
            </View>
          </GlassCard>
        ))}
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
  radarCard: {
    padding: 20,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  geofencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  geofenceText: {
    color: Colors.accentCyan,
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardWrapper: {
    flex: 1,
  },
  actionCard: {
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
  periodCard: {
    marginBottom: 10,
    padding: 14,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodNumberBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentPeriodBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  periodNumText: {
    color: '#CBD5E1',
    fontWeight: '800',
    fontSize: 13,
  },
  periodDetails: {
    flex: 1,
  },
  nowBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  nowText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
