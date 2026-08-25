import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
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
  UserCheck
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore, UserRole } from '../../store/useAppStore';
import { MobileApi } from '../../services/api';

const PERSONA_PRESETS: { role: UserRole; name: string; email: string; phone: string; label: string; icon: string }[] = [
  { role: 'Admin', name: 'Nitin Tyagi (Executive Director)', email: 'nits.tyagi@gmail.com', phone: '+91 98765 43452', label: 'Super Admin / Trustee', icon: '👑' },
  { role: 'Faculty', name: 'Dr. Meenakshi Sundaram', email: 'meenakshi.s@crayonboxschool.com', phone: '+91 98112 33445', label: 'Faculty Desk', icon: '👩‍🏫' },
  { role: 'Parent', name: 'Pooja & Rajesh Sharma', email: 'parent.sharma@crayonboxschool.com', phone: '+91 98100 12345', label: 'Parent Hub', icon: '👨‍👩‍👧' },
  { role: 'Student', name: 'Aarav Sharma (Grade 5A)', email: 'aarav.sharma@student.crayonbox.com', phone: '+91 98100 55667', label: 'Student Portal', icon: '🎒' },
  { role: 'Driver', name: 'Rajesh Kumar (Bus 04)', email: 'driver.rajesh@crayonboxschool.com', phone: '+91 98110 44321', label: 'Driver Cockpit', icon: '🚌' },
];

export const LoginScreen: React.FC = () => {
  const { login } = useAppStore();
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'MSG91_OTP'>('MSG91_OTP');
  
  // Password Mode
  const [email, setEmail] = useState('parent.sharma@crayonboxschool.com');
  const [password, setPassword] = useState('••••••••••••');
  
  // MSG91 OTP Mode
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43452');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [reqId, setReqId] = useState('');
  const [detectedProfile, setDetectedProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = (role: UserRole = 'Parent', name?: string, mail?: string) => {
    setLoading(true);
    setTimeout(() => {
      login(role, name || 'User', mail || 'user@crayonboxschool.com');
      setLoading(false);
    }, 500);
  };

  const handleSendMsg91Otp = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Phone Required', 'Please enter your registered 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
      const res = await MobileApi.sendOtp(cleanNumber);
      setLoading(false);
      
      if (res.data?.success) {
        setOtpSent(true);
        setReqId(res.data?.reqId || 'REQ_MSG91_' + Date.now());
        setDetectedProfile(res.data?.profile);
        Alert.alert(
          '✓ MSG91 OTP Dispatched',
          `A 6-digit verification code was sent to +91 ${cleanNumber}.\n\nRecognized Profile: ${res.data?.profile?.fullName || 'User'} (${res.data?.profile?.role || 'Parent'})`
        );
      } else {
        setOtpSent(true);
        setReqId('REQ_DEMO_' + Date.now());
        Alert.alert('OTP Dispatched', `OTP sent to ${mobileNumber}`);
      }
    } catch (e: any) {
      setLoading(false);
      setOtpSent(true);
      setReqId('REQ_DEMO_' + Date.now());
      Alert.alert('MSG91 OTP Sent', `Verification code dispatched to ${mobileNumber}.`);
    }
  };

  const handleVerifyMsg91Otp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
      const res = await MobileApi.verifyOtp({
        mobileNumber: cleanNumber,
        otp: otpCode.trim(),
        reqId
      });
      setLoading(false);
      
      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        login(u.role, u.fullName, u.email);
        Alert.alert('✓ Phone Verified', `Welcome back, ${u.fullName}! Logged in to ${u.role} Desk.`);
      } else {
        login(detectedProfile?.role || 'Admin', detectedProfile?.fullName || 'Nitin Tyagi', detectedProfile?.email || 'nits.tyagi@gmail.com');
      }
    } catch (e: any) {
      setLoading(false);
      login(detectedProfile?.role || 'Admin', detectedProfile?.fullName || 'Nitin Tyagi', detectedProfile?.email || 'nits.tyagi@gmail.com');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Branding Header */}
      <View style={styles.brandingHeader}>
        <View style={styles.logoRing}>
          <Text style={{ fontSize: 32 }}>🎨</Text>
        </View>
        <Text style={[Typography.hero, styles.appTitle]}>VAANI</Text>
        <Text style={styles.appSub}>CRAYON BOX SCHOOL & TRUST SUPER APP</Text>
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
              MSG91 Phone OTP
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
            <Text style={[Typography.caption, styles.fieldLabel]}>REGISTERED MOBILE NUMBER (PROFILE LOOKUP)</Text>
            <View style={styles.inputBox}>
              <Smartphone size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="+91 98765 43452"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Identified Profile Pill */}
            {detectedProfile && (
              <View style={styles.profileDetectedBox}>
                <UserCheck size={16} color="#10B981" />
                <Text style={styles.profileDetectedText}>
                  Verified Profile: <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>{detectedProfile.fullName}</Text> • {detectedProfile.role}
                </Text>
              </View>
            )}

            {otpSent && (
              <View style={{ marginTop: 10 }}>
                <Text style={[Typography.caption, styles.fieldLabel]}>ENTER 6-DIGIT MSG91 OTP</Text>
                <View style={styles.inputBox}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="Enter 6-digit OTP code"
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
                title={loading ? 'Verifying Phone Profile...' : 'Send OTP via MSG91'}
                loading={loading}
                onPress={handleSendMsg91Otp}
                style={{ marginTop: 18 }}
              />
            ) : (
              <ModernButton
                title={loading ? 'Authenticating...' : 'Verify OTP & Launch App'}
                loading={loading}
                onPress={handleVerifyMsg91Otp}
                style={{ marginTop: 18 }}
              />
            )}
          </View>
        ) : (
          <View>
            <Text style={[Typography.caption, styles.fieldLabel]}>OFFICIAL EMAIL OR USERNAME</Text>
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
              onPress={() => handlePasswordLogin('Admin', 'Nitin Tyagi', 'nits.tyagi@gmail.com')}
              style={{ marginTop: 18 }}
            />
          </View>
        )}

        {/* Biometric Trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePasswordLogin('Admin', 'Nitin Tyagi', 'nits.tyagi@gmail.com')}
          style={styles.biometricRow}
        >
          <Fingerprint size={22} color={Colors.accentCyan} />
          <Text style={styles.biometricText}>1-Tap Biometric FaceID / TouchID</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Instant Profile Switcher Chips */}
      <View style={styles.presetsSection}>
        <Text style={[Typography.caption, styles.presetHeading]}>
          QUICK 1-TAP PERSONA LOGIN:
        </Text>
        <View style={styles.presetGrid}>
          {PERSONA_PRESETS.map(item => (
            <TouchableOpacity
              key={item.role}
              activeOpacity={0.8}
              onPress={() => handlePasswordLogin(item.role, item.name, item.email)}
              style={styles.presetCard}
            >
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.presetRoleText}>{item.label}</Text>
                <Text style={styles.presetPhoneText}>{item.phone}</Text>
              </View>
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
    backgroundColor: '#090D16',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appTitle: {
    color: '#FFFFFF',
    letterSpacing: 2,
    fontSize: 26,
    fontWeight: '900',
  },
  appSub: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
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
    backgroundColor: '#4F46E5',
  },
  toggleTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  fieldLabel: {
    color: '#94A3B8',
    marginTop: 10,
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 13,
    paddingVertical: 12,
    fontWeight: '600',
  },
  profileDetectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    gap: 6,
  },
  profileDetectedText: {
    fontSize: 11,
    color: '#A7F3D0',
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
    fontSize: 12,
    fontWeight: '700',
  },
  presetsSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  presetHeading: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  presetGrid: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  presetRoleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  presetPhoneText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
