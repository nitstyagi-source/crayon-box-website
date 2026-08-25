import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BookOpen, Calendar, Send, FilePlus, Sparkles } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore } from '../../store/useAppStore';

const SUBJECT_OPTIONS = ['Mathematics', 'Science & Robotics', 'English Literature', 'Social Studies', 'Computer & AI'];

export const HomeworkPublisherScreen: React.FC = () => {
  const { publishNewHomework } = useAppStore();
  const [subject, setSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow, 9:00 AM');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter an assignment title.');
      return;
    }
    setPublishing(true);
    await publishNewHomework({
      subject,
      title,
      dueDate,
      description,
      hasAttachment: false,
    });
    setPublishing(false);
    Alert.alert('Published!', `Assignment "${title}" pushed to all Grade 4-B students and parents.`);
    setTitle('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <GlassCard highlight style={styles.formCard}>
          <Text style={[Typography.caption, { color: Colors.primaryLight }]}>NEW CLASSWORK DISPATCH</Text>
          <Text style={[Typography.h2, { color: '#FFFFFF', marginTop: 2 }]}>
            Publish Homework
          </Text>
          <Text style={[Typography.subtext, { color: '#94A3B8' }]}>
            Target Class: Grade 4 - Section B (24 Enrolled Students)
          </Text>

          {/* Subject Selector */}
          <Text style={[Typography.caption, styles.fieldLabel]}>SELECT SUBJECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
            {SUBJECT_OPTIONS.map(sub => {
              const isSelected = subject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  activeOpacity={0.8}
                  onPress={() => setSubject(sub)}
                  style={[styles.subjectPill, isSelected && styles.subjectPillActive]}
                >
                  <Text style={[styles.subjectPillText, isSelected && styles.subjectPillTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Title Input */}
          <Text style={[Typography.caption, styles.fieldLabel]}>ASSIGNMENT TITLE</Text>
          <TextInput
            placeholder="e.g. Chapter 5 - Long Division Problem Set"
            placeholderTextColor="#64748B"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          {/* Due Date Input */}
          <Text style={[Typography.caption, styles.fieldLabel]}>SUBMISSION DEADLINE</Text>
          <TextInput
            placeholder="e.g. Tomorrow, 9:00 AM"
            placeholderTextColor="#64748B"
            value={dueDate}
            onChangeText={setDueDate}
            style={styles.input}
          />

          {/* Description */}
          <Text style={[Typography.caption, styles.fieldLabel]}>INSTRUCTIONS & WORKBOOK PAGES</Text>
          <TextInput
            placeholder="Provide specific exercises, page numbers, or guidelines..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
          />

          <ModernButton
            title={publishing ? 'Pushing to Diaries...' : 'Publish to Student & Parent Diaries'}
            loading={publishing}
            onPress={handlePublish}
            style={{ marginTop: 20 }}
          />
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
    margin: 16,
    marginBottom: 100,
  },
  formCard: {
    padding: 20,
  },
  fieldLabel: {
    color: '#94A3B8',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subjectScroll: {
    marginVertical: 4,
  },
  subjectPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  subjectPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  subjectPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  subjectPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
