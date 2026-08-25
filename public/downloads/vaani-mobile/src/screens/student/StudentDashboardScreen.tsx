import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, BookOpen, BookMarked, Calendar, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  navigation: any;
}

export const StudentDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { timetable, homeworkList } = useAppStore();
  const currentPeriod = timetable.find(t => t.isCurrent) || timetable[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Active Class Banner */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.nowBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.nowText}>ONGOING PERIOD {currentPeriod.period}</Text>
            </View>
            <Text style={styles.timeRemaining}>Ends in 18 mins</Text>
          </View>

          <Text style={[Typography.hero, { color: '#FFFFFF', fontSize: 26, marginTop: 8 }]}>
            {currentPeriod.subject}
          </Text>
          <Text style={[Typography.subtext, { color: '#CBD5E1', marginTop: 2 }]}>
            Instructor: {currentPeriod.teacher} • {currentPeriod.room}
          </Text>
        </GlassCard>
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>STUDENT TOOLS</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Timetable')}
            style={styles.toolCol}
          >
            <GlassCard style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Clock size={20} color={Colors.primaryLight} />
              </View>
              <Text style={[Typography.bodyBold, styles.toolTitle]}>Full Timetable</Text>
              <Text style={styles.toolSub}>8 Periods Schedule</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DigitalDiary')}
            style={styles.toolCol}
          >
            <GlassCard style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <BookOpen size={20} color={Colors.secondary} />
              </View>
              <Text style={[Typography.bodyBold, styles.toolTitle]}>Assignments</Text>
              <Text style={styles.toolSub}>3 Active Tasks</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>

      {/* Digital Library Tracker */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>LIBRARY BOOKS ISSUED</Text>

        <GlassCard style={styles.libraryCard}>
          <View style={styles.bookRow}>
            <View style={styles.bookIconBox}>
              <BookMarked size={22} color={Colors.accentCyan} />
            </View>
            <View style={styles.bookInfo}>
              <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
                A Brief History of Time
              </Text>
              <Text style={styles.bookAuthor}>Stephen Hawking • Accession #BK-8821</Text>
              <Text style={styles.dueDateText}>Return Due: 28 Aug 2026</Text>
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
  heroCard: {
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
  nowText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  timeRemaining: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCol: {
    flex: 1,
  },
  toolCard: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  toolIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  toolSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  libraryCard: {
    padding: 14,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookAuthor: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  dueDateText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
