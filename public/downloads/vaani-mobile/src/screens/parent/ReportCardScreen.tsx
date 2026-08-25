import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Award, Download, TrendingUp, CheckCircle, Star } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ChildSwitcher } from '../../components/ChildSwitcher';
import { ModernButton } from '../../components/ModernButton';

const SUBJECT_GRADES = [
  { subject: 'Mathematics', theory: 78, practical: 20, maxMarks: 100, grade: 'A+', remarks: 'Exceptional analytical ability' },
  { subject: 'Science & Robotics', theory: 75, practical: 20, maxMarks: 100, grade: 'A+', remarks: 'Excellent project work in robotics' },
  { subject: 'English Literature', theory: 72, practical: 18, maxMarks: 100, grade: 'A', remarks: 'Good creative vocabulary' },
  { subject: 'Social Studies', theory: 74, practical: 18, maxMarks: 100, grade: 'A', remarks: 'Strong historical recall' },
  { subject: 'Computer & AI', theory: 79, practical: 20, maxMarks: 100, grade: 'A+', remarks: 'Top coder in class' },
  { subject: 'Art & Design', theory: 38, practical: 50, maxMarks: 100, grade: 'A+', remarks: 'Highly creative portfolio' },
];

export const ReportCardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ChildSwitcher />

      {/* GPA & Performance Hero */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={[Typography.caption, { color: Colors.primaryLight }]}>
                TERM 1 ACADEMIC EVALUATION
              </Text>
              <Text style={[Typography.hero, { color: '#FFFFFF', marginVertical: 4 }]}>
                94.2%
              </Text>
              <Text style={[Typography.subtext, { color: '#CBD5E1' }]}>
                Overall GPA: 3.9 / 4.0 • Grade A+
              </Text>
            </View>
            <View style={styles.rankBox}>
              <Award size={24} color={Colors.secondary} />
              <Text style={styles.rankText}>Rank #2</Text>
              <Text style={styles.rankSub}>in Class 4-B</Text>
            </View>
          </View>

          <View style={styles.behavioralRow}>
            <Star size={14} color={Colors.warning} />
            <Text style={styles.behavioralText}>
              Class Teacher Remarks: Exemplary conduct, active contributor in STEM.
            </Text>
          </View>
        </GlassCard>
      </View>

      {/* Subject Scorecards */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <View style={styles.headerWithAction}>
          <Text style={[Typography.caption, styles.sectionTitle]}>SUBJECT-WISE PERFORMANCE</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('Report Card Saved', 'Official signed PDF report card downloaded.')}
            style={styles.downloadLink}
          >
            <Download size={14} color={Colors.primaryLight} />
            <Text style={styles.downloadLinkText}>Official PDF</Text>
          </TouchableOpacity>
        </View>

        {SUBJECT_GRADES.map(item => {
          const total = item.theory + item.practical;
          return (
            <GlassCard key={item.subject} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>{item.subject}</Text>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{item.grade}</Text>
                </View>
              </View>

              <View style={styles.marksRow}>
                <Text style={styles.marksLabel}>
                  Theory: <Text style={styles.marksVal}>{item.theory}/80</Text>
                </Text>
                <Text style={styles.marksLabel}>
                  Practical: <Text style={styles.marksVal}>{item.practical}/20</Text>
                </Text>
                <Text style={[styles.marksLabel, { color: Colors.primaryLight }]}>
                  Total: <Text style={[styles.marksVal, { color: '#FFFFFF' }]}>{total}/100</Text>
                </Text>
              </View>

              <Text style={styles.remarkText}>“{item.remarks}”</Text>
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
    marginTop: 10,
  },
  heroCard: {
    padding: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankBox: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  rankText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  rankSub: {
    color: '#F472B6',
    fontSize: 10,
  },
  behavioralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
    gap: 8,
  },
  behavioralText: {
    color: '#E2E8F0',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  headerWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#64748B',
    letterSpacing: 0.8,
  },
  downloadLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadLinkText: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  subjectCard: {
    marginBottom: 10,
    padding: 14,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gradeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  gradeBadgeText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  marksRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 4,
  },
  marksLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  marksVal: {
    fontWeight: '700',
  },
  remarkText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
