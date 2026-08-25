import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Users, CheckCircle2, XCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore } from '../../store/useAppStore';

export const AttendanceRegisterScreen: React.FC = () => {
  const { studentRoster, toggleStudentAttendance, submitClassAttendance } = useAppStore();
  const [submitting, setSubmitting] = useState(false);

  const presentCount = studentRoster.filter(s => s.status === 'Present').length;
  const absentCount = studentRoster.filter(s => s.status === 'Absent').length;
  const lateCount = studentRoster.filter(s => s.status === 'Late').length;

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitClassAttendance('Grade 4', 'B', 'Period 1');
    setSubmitting(false);
    Alert.alert(
      'Attendance Synchronized',
      `Class 4-B attendance recorded. ${presentCount} Present, ${absentCount} Absent, ${lateCount} Late.`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return Colors.success;
      case 'Absent':
        return Colors.danger;
      case 'Late':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Info */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[Typography.caption, { color: Colors.primaryLight }]}>
                DAILY ATTENDANCE REGISTER
              </Text>
              <Text style={[Typography.h2, { color: '#FFFFFF', marginTop: 2 }]}>
                Grade 4 - Section B
              </Text>
              <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
                Period 1 (Mathematics) • Date: {new Date().toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.classIcon}>
              <Users size={24} color={Colors.primaryLight} />
            </View>
          </View>

          {/* Quick Counter Row */}
          <View style={styles.counterRow}>
            <View style={[styles.counterBox, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={[styles.counterVal, { color: Colors.success }]}>{presentCount}</Text>
              <Text style={styles.counterLabel}>Present</Text>
            </View>
            <View style={[styles.counterBox, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <Text style={[styles.counterVal, { color: Colors.danger }]}>{absentCount}</Text>
              <Text style={styles.counterLabel}>Absent</Text>
            </View>
            <View style={[styles.counterBox, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
              <Text style={[styles.counterVal, { color: Colors.warning }]}>{lateCount}</Text>
              <Text style={styles.counterLabel}>Late</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Student List */}
      <View style={[styles.section, { marginBottom: 120 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>
          TAP STATUS BADGE TO TOGGLE (PRESENT / ABSENT / LATE)
        </Text>

        {studentRoster.map(student => {
          const statusColor = getStatusColor(student.status);
          return (
            <GlassCard key={student.id} style={styles.studentCard}>
              <View style={styles.studentRow}>
                <View style={styles.rollBox}>
                  <Text style={styles.rollText}>#{student.rollNo}</Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
                    {student.name}
                  </Text>
                  <Text style={styles.stuIdText}>{student.id}</Text>
                </View>

                {/* 1-Tap Toggle Badge */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleStudentAttendance(student.id)}
                  style={[styles.statusToggle, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusToggleText, { color: statusColor }]}>
                    {student.status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })}

        <ModernButton
          title={submitting ? 'Syncing with ERP...' : 'Submit & Sync Attendance to ERP'}
          loading={submitting}
          onPress={handleSubmit}
          style={{ marginTop: 16 }}
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
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  headerCard: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  counterBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  counterVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  studentCard: {
    marginBottom: 8,
    padding: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rollText: {
    color: Colors.primaryLight,
    fontWeight: '800',
    fontSize: 12,
  },
  nameCol: {
    flex: 1,
  },
  stuIdText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
