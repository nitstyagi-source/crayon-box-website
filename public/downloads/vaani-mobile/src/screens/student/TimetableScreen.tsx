import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, MapPin, User, Coffee } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

export const TimetableScreen: React.FC = () => {
  const { timetable } = useAppStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <GlassCard highlight style={styles.headerCard}>
          <Text style={[Typography.caption, { color: Colors.primaryLight }]}>
            WEEKLY MASTER SCHEDULE
          </Text>
          <Text style={[Typography.h2, { color: '#FFFFFF', marginTop: 2 }]}>
            Grade 4 - Section B
          </Text>
          <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
            Academic Year 2026-27 • 8 Periods Daily
          </Text>
        </GlassCard>
      </View>

      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>MONDAY THROUGH FRIDAY SCHEDULE</Text>

        {timetable.map(item => {
          const isBreak = item.period === 'Break';
          return (
            <GlassCard
              key={item.period}
              style={styles.periodCard}
              accentBorderColor={item.isCurrent ? Colors.primaryLight : undefined}
            >
              <View style={styles.periodRow}>
                <View
                  style={[
                    styles.periodBox,
                    item.isCurrent && styles.periodBoxActive,
                    isBreak && styles.periodBoxBreak,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      item.isCurrent && { color: Colors.primaryLight },
                      isBreak && { color: Colors.warning },
                    ]}
                  >
                    {isBreak ? '☕' : `P${item.period}`}
                  </Text>
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.topRow}>
                    <Text
                      style={[
                        Typography.bodyBold,
                        { color: '#FFFFFF', fontSize: 15 },
                        isBreak && { color: Colors.warning },
                      ]}
                    >
                      {item.subject}
                    </Text>
                    {item.isCurrent && (
                      <View style={styles.nowPill}>
                        <Text style={styles.nowText}>CURRENT</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{item.room}</Text>
                    </View>
                    {!isBreak && (
                      <View style={styles.metaItem}>
                        <User size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.teacher}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </GlassCard>
          );
        })}
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
  periodCard: {
    marginBottom: 10,
    padding: 14,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  periodBoxActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  periodBoxBreak: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  periodText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '800',
  },
  detailsCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nowPill: {
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  nowText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
