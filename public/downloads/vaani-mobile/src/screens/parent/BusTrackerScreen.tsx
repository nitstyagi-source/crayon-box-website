import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import {
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  Gauge,
  CheckCircle2,
  CircleDot,
  MapPin,
  ShieldAlert,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { LiveIndicator } from '../../components/LiveIndicator';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore } from '../../store/useAppStore';

export const BusTrackerScreen: React.FC = () => {
  const { busData } = useAppStore();

  const handleCallDriver = () => {
    Linking.openURL(`tel:${busData.driverPhone}`).catch(() => {
      Alert.alert('Calling Driver', `Dialing ${busData.driverPhone}...`);
    });
  };

  const handleSmsDriver = () => {
    Linking.openURL(`sms:${busData.driverPhone}`).catch(() => {
      Alert.alert('Messaging Driver', `Opening SMS to ${busData.driverPhone}...`);
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Live Map Radar Stage */}
      <View style={styles.mapStage}>
        <View style={styles.radarCard}>
          <View style={styles.radarTop}>
            <LiveIndicator label="BUS IN TRANSIT" color={Colors.success} size="sm" />
            <View style={styles.speedPill}>
              <Gauge size={14} color={Colors.success} />
              <Text style={styles.speedText}>{busData.speedKmH} km/h</Text>
            </View>
          </View>

          {/* Graphical Map Representation */}
          <View style={styles.mapVisual}>
            <View style={styles.busMarkerGlow}>
              <View style={styles.busMarker}>
                <Navigation size={22} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.currentLocName}>{busData.currentLocation}</Text>
            <Text style={styles.coordsText}>
              GPS: {busData.latitude}° N, {busData.longitude}° E (Accuracy: 4m)
            </Text>
          </View>

          {/* Quick ETA Cards */}
          <View style={styles.etaRow}>
            <View style={styles.etaCol}>
              <Text style={styles.etaLabel}>NEXT STOP</Text>
              <Text style={styles.etaValue}>{busData.nextStop}</Text>
            </View>
            <View style={styles.etaColRight}>
              <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={[styles.etaValue, { color: Colors.success }]}>
                {busData.etaMinutes} MINS
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Driver Contact Desk */}
      <View style={styles.section}>
        <GlassCard style={styles.driverCard}>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 24 }}>👨‍✈️</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={[Typography.caption, { color: '#94A3B8' }]}>ASSIGNED DRIVER</Text>
              <Text style={[Typography.bodyBold, { color: '#FFFFFF', fontSize: 16 }]}>
                {busData.driverName}
              </Text>
              <Text style={[Typography.subtext, { color: '#CBD5E1' }]}>{busData.driverPhone}</Text>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCallDriver}
                style={[styles.contactBtn, { backgroundColor: Colors.success }]}
              >
                <Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSmsDriver}
                style={[styles.contactBtn, { backgroundColor: Colors.primary }]}
              >
                <MessageSquare size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Route Timeline */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>ROUTE STOPS TIMELINE</Text>

        <GlassCard style={styles.timelineCard}>
          {busData.stops.map((stop, index) => {
            const isLast = index === busData.stops.length - 1;
            return (
              <View key={stop.id} style={styles.stopRow}>
                <View style={styles.timelineIndicatorCol}>
                  {stop.completed ? (
                    <CheckCircle2 size={20} color={Colors.success} />
                  ) : stop.isChildStop ? (
                    <CircleDot size={20} color={Colors.warning} />
                  ) : (
                    <MapPin size={18} color="#64748B" />
                  )}
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        stop.completed && { backgroundColor: Colors.success },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stopDetailsCol}>
                  <View style={styles.stopHeader}>
                    <Text
                      style={[
                        Typography.bodyBold,
                        stop.isChildStop && { color: Colors.warning },
                        stop.completed && { color: '#94A3B8' },
                      ]}
                    >
                      {stop.name}
                    </Text>
                    <Text style={styles.stopTime}>{stop.time}</Text>
                  </View>
                  {stop.isChildStop && (
                    <Text style={styles.childStopBadge}>📍 Your Child's Designated Pickup/Drop Point</Text>
                  )}
                </View>
              </View>
            );
          })}
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
  mapStage: {
    padding: 16,
  },
  radarCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 18,
  },
  radarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  speedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  mapVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  busMarkerGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  busMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  currentLocName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  coordsText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  etaRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  etaCol: {
    flex: 1,
  },
  etaColRight: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  etaValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
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
  driverCard: {
    padding: 14,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    padding: 16,
  },
  stopRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 14,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  stopDetailsCol: {
    flex: 1,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopTime: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  childStopBadge: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
