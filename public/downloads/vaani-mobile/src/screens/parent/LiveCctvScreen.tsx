import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import {
  Video,
  Shield,
  Maximize2,
  Camera as CameraIcon,
  Eye,
  Lock,
  Wifi,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { LiveIndicator } from '../../components/LiveIndicator';
import { useAppStore } from '../../store/useAppStore';

const { width } = Dimensions.get('window');

export const LiveCctvScreen: React.FC = () => {
  const { cameras } = useAppStore();
  const [selectedCam, setSelectedCam] = useState(cameras[2] || cameras[0]); // Default to Grade 4 Classroom

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Video Player Stage */}
      <View style={styles.playerContainer}>
        <View style={styles.screenStage}>
          {/* Simulated Live Stream Feed View */}
          <View style={styles.streamFeedPlaceholder}>
            <View style={styles.feedHeader}>
              <LiveIndicator label="LIVE FEED" size="sm" />
              <View style={styles.metaPill}>
                <Wifi size={12} color={Colors.success} />
                <Text style={styles.metaText}>HD 1080p • 30 FPS</Text>
              </View>
            </View>

            <View style={styles.feedCenter}>
              <View style={styles.camLensRing}>
                <Eye size={36} color={Colors.primaryLight} />
              </View>
              <Text style={styles.roomBigTitle}>{selectedCam.name}</Text>
              <Text style={styles.roomLocationSub}>Location: {selectedCam.room} • Wing B</Text>
              <Text style={styles.liveTimecode}>
                {new Date().toLocaleTimeString()} (Secure AES-256 DRM)
              </Text>
            </View>

            {/* Stream Player Controls Bar */}
            <View style={styles.feedControls}>
              <TouchableOpacity activeOpacity={0.7} style={styles.playerControlBtn}>
                <CameraIcon size={16} color="#FFFFFF" />
                <Text style={styles.controlBtnText}>Snapshot</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.playerControlBtn}>
                <Maximize2 size={16} color="#FFFFFF" />
                <Text style={styles.controlBtnText}>Fullscreen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security & Privacy Banner */}
        <View style={styles.securityBanner}>
          <Shield size={14} color={Colors.success} />
          <Text style={styles.securityText}>
            Verified Parent Access • Stream active during official school hours (08:00 AM - 03:30 PM)
          </Text>
        </View>
      </View>

      {/* Classroom Cameras Selector */}
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>ALL 16 CAMPUS CCTV FEEDS</Text>

        <View style={styles.cameraGrid}>
          {cameras.map(cam => {
            const isSelected = selectedCam.id === cam.id;
            return (
              <TouchableOpacity
                key={cam.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCam(cam)}
                style={styles.camCardWrapper}
              >
                <GlassCard
                  style={[styles.camCard, isSelected ? styles.camCardSelected : {}]}
                  accentBorderColor={isSelected ? Colors.primaryLight : undefined}
                >
                  <View style={styles.camCardTop}>
                    <Text style={styles.roomBadge}>{cam.room}</Text>
                    <LiveIndicator size="sm" label={cam.status.toUpperCase()} />
                  </View>
                  <Text style={[Typography.bodyBold, styles.camName, isSelected && { color: '#FFFFFF' }]}>
                    {cam.name}
                  </Text>
                  <Text style={styles.camQuality}>
                    {cam.quality} • {cam.fps} FPS
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Cloud Gateway URL info */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <GlassCard style={styles.gatewayInfoCard}>
          <View style={styles.gatewayRow}>
            <Sparkles size={16} color={Colors.accentCyan} />
            <Text style={styles.gatewayTitle}>AI Smart Gateway Active</Text>
          </View>
          <Text style={styles.gatewaySub}>
            Direct zero-lag proxy connected to Cloudflare Edge tunnel with automated classroom privacy killswitch.
          </Text>
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
  playerContainer: {
    padding: 16,
  },
  screenStage: {
    width: '100%',
    height: 220,
    backgroundColor: '#070A10',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    overflow: 'hidden',
  },
  streamFeedPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'space-between',
    padding: 14,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  metaText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  feedCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camLensRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roomBigTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  roomLocationSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  liveTimecode: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  feedControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  playerControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  securityText: {
    color: '#6EE7B7',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
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
  cameraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  camCardWrapper: {
    width: '48%',
  },
  camCard: {
    padding: 14,
  },
  camCardSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  camCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomBadge: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  camName: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  camQuality: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  gatewayInfoCard: {
    padding: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  gatewayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gatewayTitle: {
    color: Colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
  },
  gatewaySub: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
});
