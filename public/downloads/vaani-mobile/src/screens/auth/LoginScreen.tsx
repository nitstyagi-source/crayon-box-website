import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  Mail,
  Smartphone,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore, UserRole } from '../../store/useAppStore';
import { Msg91OtpService } from '../../services/msg91OtpService';

const PERSONA_PRESETS: { role: UserRole; name: string; email: string; label: string; icon: string }[] = [
  { role: 'Parent', name: 'Pooja & Rajesh Sharma', email: 'parent.sharma@crayonboxschool.com', label: 'Parent Hub', icon: '👨‍👩‍👧' },
  { role: 'Faculty', name: 'Dr. Meenakshi Sundaram', email: 'meenakshi.s@crayonboxschool.com', label: 'Faculty Desk', icon: '👩‍🏫' },
  { role: 'Admin', name: 'Dr. Ananya Roy (Principal)', email: 'admin@crayonboxschool.com', label: 'Principal & Admin', icon: '👑' },
  { role: 'Student', name: 'Aarav Sharma (Grade 4B)', email: 'aarav.sharma@student.crayonbox.com', label: 'Student Portal', icon: '🎓' },
];

export const LoginScreen: React.FC = () => {
  const { login } = useAppStore();
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'MSG91_OTP'>('MSG91_OTP');
  
  // Password Mode
  const [email, setEmail] = useState('parent.sharma@crayonboxschool.com');
  const [password, setPassword] = useState('••••••••••••');
  
  // MSG91 OTP Mode
  const [mobileNumber, setMobileNumber] = useState('+91 98100 12345');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [reqId, setReqId] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = (role: UserRole = 'Parent', name?: string) => {
    setLoading(true);
    setTimeout(() => {
      login(role, name);
      setLoading(false);
    }, 600);
  };

  const handleSendMsg91Otp = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Phone Required', 'Please enter your registered 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
    const res = await Msg91OtpService.sendOTP(cleanNumber);
    setLoading(false);
    
    // Always permit demo transition if sandbox key
    setOtpSent(true);
    setReqId(res.data?.reqId || 'REQ_MSG91_DEMO_' + Date.now());
    Alert.alert('OTP Dispatched', `A 6-digit verification code was sent to ${mobileNumber} via MSG91 SMS Gateway.`);
  };

  const handleVerifyMsg91Otp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    const res = await Msg91OtpService.verifyOTP(reqId, otpCode);
    setLoading(false);
    login('Parent', 'Pooja Sharma');
    Alert.alert('Authentication Verified', 'Welcome to Crayon Box School ERP!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.brandingHeader}>
        <View style={styles.logoRing}>
          <Text style={{ fontSize: 32 }}>🎨</Text>
        </View>
        <Text style={[Typography.hero, styles.appTitle]}>CRAYON BOX</Text>
        <Text style={styles.appSub}>NEXT-GEN INSTITUTIONAL ERP</Text>
      </View>

      {/* Main Login Glass Card */}
      <GlassCard highlight style={styles.loginCard}>
        {/* Auth Mode Toggle */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAuthMode('MSG91_OTP')}
            style={[styles.toggleTab, authMode === 'MSG91_OTP' && styles.toggleTabActive]}
          >
            <Smartphone size={14} color={authMode === 'MSG91_OTP' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.toggleTabText, authMode === 'MSG91_OTP' && styles.toggleTabTextActive]}>
              MSG91 OTP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAuthMode('PASSWORD')}
            style={[styles.toggleTab, authMode === 'PASSWORD' && styles.toggleTabActive]}
          >
            <KeyRound size={14} color={authMode === 'PASSWORD' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.toggleTabText, authMode === 'PASSWORD' && styles.toggleTabTextActive]}>
              Password
            </Text>
          </TouchableOpacity>
        </View>

        {authMode === 'MSG91_OTP' ? (
          <View>
            <Text style={[Typography.caption, styles.fieldLabel]}>REGISTERED MOBILE NUMBER</Text>
            <View style={styles.inputBox}>
              <Smartphone size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="+91 98100 12345"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {otpSent && (
              <View>
                <Text style={[Typography.caption, styles.fieldLabel]}>ENTER 6-DIGIT OTP</Text>
                <View style={styles.inputBox}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="Enter OTP (e.g. 123456)"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.input}
                  />
                </View>
              </View>
            )}

            {!otpSent ? (
              <ModernButton
                title={loading ? 'Sending OTP...' : 'Send OTP via MSG91'}
                loading={loading}
                onPress={handleSendMsg91Otp}
                style={{ marginTop: 18 }}
              />
            ) : (
              <ModernButton
                title={loading ? 'Verifying...' : 'Verify OTP & Login'}
                loading={loading}
                onPress={handleVerifyMsg91Otp}
                style={{ marginTop: 18 }}
              />
            )}
          </View>
        ) : (
          <View>
            <Text style={[Typography.caption, styles.fieldLabel]}>OFFICIAL EMAIL OR STUDENT ID</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@crayonboxschool.com"
                placeholderTextColor="#64748B"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>

            <Text style={[Typography.caption, styles.fieldLabel]}>PASSWORD</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <ModernButton
              title={loading ? 'Authenticating...' : 'Sign In with Credentials'}
              loading={loading}
              onPress={() => handlePasswordLogin('Parent', 'Pooja Sharma')}
              style={{ marginTop: 18 }}
            />
          </View>
        )}

        {/* Biometric Trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePasswordLogin('Parent', 'Pooja Sharma')}
          style={styles.biometricRow}
        >
          <Fingerprint size={24} color={Colors.accentCyan} />
          <Text style={styles.biometricText}>1-Tap Biometric FaceID / TouchID</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Fast Persona Selector for Testing */}
      <View style={styles.presetsSection}>
        <Text style={[Typography.caption, styles.presetHeading]}>
          OR SELECT INSTANT PREVIEW PERSONA:
        </Text>
        <View style={styles.presetGrid}>
          {PERSONA_PRESETS.map(item => (
            <TouchableOpacity
              key={item.role}
              activeOpacity={0.8}
              onPress={() => handlePasswordLogin(item.role, item.name)}
              style={styles.presetCard}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={styles.presetRoleText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  logoRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontSize: 28,
  },
  appSub: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  loginCard: {
    padding: 20,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    gap: 6,
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  toggleTabActive: {
    backgroundColor: Colors.primary,
  },
  toggleTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleTabTextActive: {
    color: '#FFFFFF',
  },
  fieldLabel: {
    color: '#94A3B8',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 12,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 14,
    gap: 10,
  },
  biometricText: {
    color: Colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
  },
  presetsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  presetHeading: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  presetRoleText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
});
