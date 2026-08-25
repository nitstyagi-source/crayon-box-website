import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import {
  Navigation as NavIcon,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Users,
  Clock,
  Gauge
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

export const DriverCockpitScreen: React.FC = () => {
  const {
    isBroadcastingGps,
    driverSpeed,
    driverRoute,
    toggleGpsBroadcast,
    updateDriverGps,
    markRouteStopCompleted
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'route' | 'students'>('route');

  // Simulated GPS Broadcast Loop when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBroadcastingGps) {
      interval = setInterval(() => {
        const randomSpeed = Math.floor(25 + Math.random() * 15);
        updateDriverGps({
          latitude: 28.6295 + (Math.random() - 0.5) * 0.005,
          longitude: 77.3725 + (Math.random() - 0.5) * 0.005,
          speed: randomSpeed
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isBroadcastingGps]);

  const handleSosPress = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS DISPATCH',
      'Are you sure you want to trigger an Emergency Alert to School Control Room & Parents?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH SOS',
          style: 'destructive',
          onPress: () => Alert.alert('✓ SOS Dispatched', 'School transport coordinator & security desk have been notified.')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Cockpit Status Banner */}
      <GlassCard variant="glow" style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroLeft}>
            <Text style={styles.routeTag}>BUS 04 • ROUTE 12</Text>
            <Text style={styles.heroTitle}>Driver Telematics Cockpit</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isBroadcastingGps ? '#10B98120' : '#EF444420' }]}>
            <Radio size={14} color={isBroadcastingGps ? '#10B981' : '#EF4444'} />
            <Text style={[styles.statusText, { color: isBroadcastingGps ? '#10B981' : '#EF4444' }]}>
              {isBroadcastingGps ? 'BROADCASTING' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Live Speed & GPS Toggle */}
        <View style={styles.telematicsGrid}>
          <View style={styles.telematicsItem}>
            <Gauge size={20} color="#818CF8" />
            <Text style={styles.telematicsValue}>
              {isBroadcastingGps ? `${driverSpeed}` : '0'} <Text style={styles.unitText}>km/h</Text>
            </Text>
            <Text style={styles.telematicsLabel}>Live Speed</Text>
          </View>

          <View style={styles.telematicsDivider} />

          <View style={styles.telematicsItem}>
            <Clock size={20} color="#34D399" />
            <Text style={styles.telematicsValue}>03:00 <Text style={styles.unitText}>PM</Text></Text>
            <Text style={styles.telematicsLabel}>Next Stop ETA</Text>
          </View>

          <View style={styles.telematicsDivider} />

          <View style={styles.telematicsItem}>
            <Switch
              value={isBroadcastingGps}
              onValueChange={toggleGpsBroadcast}
              trackColor={{ false: '#334155', true: '#4F46E5' }}
              thumbColor={isBroadcastingGps ? '#818CF8' : '#94A3B8'}
            />
            <Text style={styles.telematicsLabel}>GPS Live</Text>
          </View>
        </View>
      </GlassCard>

      {/* Emergency SOS Button */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleSosPress} style={styles.sosButton}>
        <AlertTriangle size={20} color="#FFFFFF" />
        <Text style={styles.sosText}>EMERGENCY SOS ALERT</Text>
      </TouchableOpacity>

      {/* Route Stops Checklist */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Route Stops Checklist</Text>
        <Text style={styles.sectionSubtitle}>Tap when bus reaches stop</Text>
      </View>

      <View style={styles.stopsList}>
        {driverRoute.map((stop, index) => (
          <GlassCard key={index} style={[styles.stopCard, stop.completed && styles.completedStopCard]}>
            <View style={styles.stopLeft}>
              <View style={[styles.stopNumber, { backgroundColor: stop.completed ? '#10B981' : '#4F46E5' }]}>
                {stop.completed ? (
                  <CheckCircle2 size={14} color="#FFFFFF" />
                ) : (
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stopDetails}>
                <Text style={[styles.stopName, stop.completed && styles.completedText]}>
                  {stop.name}
                </Text>
                <Text style={styles.stopTime}>Scheduled: {stop.time}</Text>
              </View>
            </View>

            {!stop.completed && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => markRouteStopCompleted(index)}
                style={styles.reachButton}
              >
                <Text style={styles.reachButtonText}>Reached</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        ))}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
  },
  routeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telematicsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  telematicsItem: {
    alignItems: 'center',
    gap: 4,
  },
  telematicsDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  telematicsValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  telematicsLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  stopsList: {
    gap: 10,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  completedStopCard: {
    opacity: 0.6,
  },
  stopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  stopTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  reachButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reachButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
