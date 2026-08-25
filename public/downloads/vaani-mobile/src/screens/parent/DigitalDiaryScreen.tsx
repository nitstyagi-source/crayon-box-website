import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Filter,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ChildSwitcher } from '../../components/ChildSwitcher';
import { useAppStore } from '../../store/useAppStore';

const SUBJECT_FILTERS = ['All', 'Mathematics', 'Science & Robotics', 'English Literature', 'Social Studies'];

export const DigitalDiaryScreen: React.FC = () => {
  const { homeworkList } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredList =
    selectedSubject === 'All'
      ? homeworkList
      : homeworkList.filter(item => item.subject.toLowerCase().includes(selectedSubject.toLowerCase().split(' ')[0]));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ChildSwitcher />

      {/* Subject Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {SUBJECT_FILTERS.map(sub => {
            const isSelected = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                activeOpacity={0.8}
                onPress={() => setSelectedSubject(sub)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Homework Timeline Feed */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>DAILY ASSIGNMENTS & HOMEWORK</Text>

        {filteredList.map(item => {
          const isSubmitted = item.status === 'Submitted' || item.status === 'Graded';
          return (
            <GlassCard key={item.id} style={styles.hwCard}>
              <View style={styles.hwTopRow}>
                <View style={styles.subjectBadge}>
                  <BookOpen size={12} color={Colors.primaryLight} />
                  <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isSubmitted
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isSubmitted ? Colors.success : Colors.danger },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[Typography.h3, styles.titleText]}>{item.title}</Text>
              <Text style={[Typography.body, styles.descText]}>{item.description}</Text>

              {/* Due Date & Teacher */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Clock size={12} color="#94A3B8" />
                  <Text style={styles.metaLabel}>Due: {item.dueDate}</Text>
                </View>
                <Text style={styles.teacherTag}>by {item.teacherName}</Text>
              </View>

              {/* Attachment Preview if any */}
              {item.hasAttachment && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('File Downloaded', `Saved ${item.attachmentName} to offline storage.`)}
                  style={styles.attachmentBox}
                >
                  <FileText size={16} color={Colors.accentCyan} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {item.attachmentName}
                  </Text>
                  <Download size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}

              {item.gradeScore && (
                <View style={styles.scoreBox}>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={styles.scoreText}>Graded Score: {item.gradeScore}</Text>
                </View>
              )}
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
  filterWrapper: {
    marginVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  hwCard: {
    marginBottom: 12,
  },
  hwTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  subjectText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  titleText: {
    color: '#FFFFFF',
    marginBottom: 4,
  },
  descText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  teacherTag: {
    color: '#64748B',
    fontSize: 11,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  scoreText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
});
