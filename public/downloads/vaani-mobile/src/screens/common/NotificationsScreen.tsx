import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, AlertTriangle, Navigation, CreditCard, BookOpen, CheckCircle } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Bus 04 Approaching Stop',
    desc: 'Bus 04 (Route 12) is 8 minutes away from Apex Tower Gate 2.',
    time: '2 mins ago',
    type: 'bus',
    icon: <Navigation size={18} color={Colors.success} />,
    color: Colors.success,
  },
  {
    id: '2',
    title: 'New Mathematics Homework Posted',
    desc: 'Dr. Meenakshi Sundaram assigned "Algebraic Expressions - Ex 4.2" due tomorrow.',
    time: '1 hour ago',
    type: 'homework',
    icon: <BookOpen size={18} color={Colors.primaryLight} />,
    color: Colors.primary,
  },
  {
    id: '3',
    title: 'Term 2 Fee Invoice Available',
    desc: 'Fee invoice INV-2026-Q2-188 for ₹45,000 is due on 30 August 2026.',
    time: 'Yesterday',
    type: 'fee',
    icon: <CreditCard size={18} color={Colors.warning} />,
    color: Colors.warning,
  },
  {
    id: '4',
    title: 'Parent-Teacher Meeting Schedule',
    desc: 'Quarterly academic review meeting scheduled for Saturday, 29 August.',
    time: '2 days ago',
    type: 'circular',
    icon: <Bell size={18} color={Colors.secondary} />,
    color: Colors.secondary,
  },
];

export const NotificationsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>RECENT ALERTS & CIRCULARS</Text>

        {NOTIFICATIONS.map(item => (
          <GlassCard key={item.id} style={styles.notifCard}>
            <View style={styles.notifRow}>
              <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                {item.icon}
              </View>
              <View style={styles.infoCol}>
                <View style={styles.titleRow}>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF', flex: 1 }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={[Typography.body, styles.descText]}>{item.desc}</Text>
              </View>
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
    margin: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  notifCard: {
    marginBottom: 10,
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeText: {
    color: '#64748B',
    fontSize: 10,
    marginLeft: 8,
  },
  descText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
});
