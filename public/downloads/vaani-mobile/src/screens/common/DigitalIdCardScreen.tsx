import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert
} from 'react-native';
import {
  QrCode,
  ShieldCheck,
  Share2,
  Users,
  Building2,
  Phone,
  Droplet
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

export const DigitalIdCardScreen: React.FC = () => {
  const { userName, userRole, activeChildId } = useAppStore();
  const [cardType, setCardType] = useState<'student' | 'escort'>('student');

  const studentInfo = {
    name: 'Aarav Sharma',
    admissionNo: 'CBS-2026-0001',
    grade: 'Grade 5-A',
    rollNo: '04',
    dob: '14 Nov 2015',
    bloodGroup: 'O+ Positive',
    parentName: 'Mr. Nitin Sharma',
    parentPhone: '+91 98765 43452',
    busRoute: 'Bus 04 (Stop: Apex Tower Gate 2)'
  };

  const escortInfo = {
    escortName: 'Mrs. Sunita Sharma (Mother)',
    relation: 'Mother',
    studentName: 'Aarav Sharma (Grade 5-A)',
    aadhaarVerified: true,
    passValidity: 'Academic Session 2026-27'
  };

  const handleShareCard = async () => {
    try {
      await Share.share({
        message: `Official Digital ID Pass: ${studentInfo.name} (${studentInfo.admissionNo}) • Crayon Box High School • Valid 2026-27`,
        title: 'Crayon Box Digital ID Pass'
      });
    } catch (e) {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Selector Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setCardType('student')}
          style={[styles.tabBtn, cardType === 'student' && styles.activeTabBtn]}
        >
          <Text style={[styles.tabBtnText, cardType === 'student' && styles.activeTabBtnText]}>
            🪪 Student ID Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCardType('escort')}
          style={[styles.tabBtn, cardType === 'escort' && styles.activeTabBtn]}
        >
          <Text style={[styles.tabBtnText, cardType === 'escort' && styles.activeTabBtnText]}>
            🛡️ Escort Gate Pass
          </Text>
        </TouchableOpacity>
      </View>

      {/* ID Card Presentation */}
      <View style={styles.cardWrapper}>
        <GlassCard variant="glow" style={styles.idCard}>
          
          {/* Card Top Banner */}
          <View style={styles.cardHeader}>
            <View style={styles.crestWrap}>
              <Text style={styles.crestText}>CB</Text>
            </View>
            <View style={styles.schoolDetails}>
              <Text style={styles.schoolName}>CRAYON BOX HIGH SCHOOL</Text>
              <Text style={styles.trustName}>Vani Educational Trust (VET)</Text>
            </View>
          </View>

          {cardType === 'student' ? (
            <>
              {/* Student Photo & QR Matrix */}
              <View style={styles.middleSection}>
                <View style={styles.photoBox}>
                  <Text style={styles.photoPlaceholder}>STU</Text>
                </View>
                <View style={styles.qrBox}>
                  <QrCode size={70} color="#FFFFFF" />
                  <Text style={styles.qrLabel}>Live Gate Scan</Text>
                </View>
              </View>

              {/* Student Identity Data */}
              <View style={styles.infoSection}>
                <Text style={styles.studentNameText}>{studentInfo.name}</Text>
                <Text style={styles.admissionText}>{studentInfo.admissionNo} • {studentInfo.grade}</Text>
                
                <View style={styles.metaGrid}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Blood Group:</Text>
                    <Text style={styles.metaValue}>{studentInfo.bloodGroup}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Roll No:</Text>
                    <Text style={styles.metaValue}>{studentInfo.rollNo}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Emergency Contact:</Text>
                    <Text style={styles.metaValue}>{studentInfo.parentPhone}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Bus Route:</Text>
                    <Text style={styles.metaValue}>{studentInfo.busRoute}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.middleSection}>
                <View style={[styles.photoBox, { backgroundColor: '#F59E0B' }]}>
                  <ShieldCheck size={32} color="#FFFFFF" />
                </View>
                <View style={styles.qrBox}>
                  <QrCode size={70} color="#FFFFFF" />
                  <Text style={styles.qrLabel}>Pickup Verified</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.studentNameText}>{escortInfo.escortName}</Text>
                <Text style={styles.admissionText}>Authorized Escort • {escortInfo.relation}</Text>
                
                <View style={styles.metaGrid}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Pickup Student:</Text>
                    <Text style={styles.metaValue}>{escortInfo.studentName}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Government ID:</Text>
                    <Text style={styles.metaValue}>Aadhaar Verified ✓</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Validity:</Text>
                    <Text style={styles.metaValue}>{escortInfo.passValidity}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.footerSecurity}>🔒 Encrypted Dynamic QR • Tap to scan at Gate Scanner</Text>
          </View>

        </GlassCard>
      </View>

      {/* Share / Save Actions */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleShareCard} style={styles.shareBtn}>
        <Share2 size={18} color="#FFFFFF" />
        <Text style={styles.shareBtnText}>Share Digital ID Pass</Text>
      </TouchableOpacity>

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    backgroundColor: '#4F46E5',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cardWrapper: {
    alignItems: 'center',
  },
  idCard: {
    width: '100%',
    padding: 18,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  crestWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trustName: {
    fontSize: 10,
    color: '#818CF8',
    fontWeight: '600',
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  photoBox: {
    width: 80,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  photoPlaceholder: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  qrBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qrLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#818CF8',
    marginTop: 4,
  },
  infoSection: {
    gap: 4,
  },
  studentNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  admissionText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  metaGrid: {
    marginTop: 8,
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  footerSecurity: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
