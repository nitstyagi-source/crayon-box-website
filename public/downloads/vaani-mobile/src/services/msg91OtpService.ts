import { OTPWidget } from '@msg91comm/sendotp-react-native';

// Live MSG91 SendOTP Configuration provided by user
export const MSG91_CONFIG = {
  widgetId: process.env.EXPO_PUBLIC_MSG91_WIDGET_ID || '3668766f6a71323234393034',
  tokenAuth: process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH || '319435TL9QVRfp6n6a89bdeaP1',
};

// Initialize Widget on app load
let isInitialized = false;

export const initMsg91Widget = async () => {
  if (!isInitialized) {
    try {
      await OTPWidget.initializeWidget(MSG91_CONFIG.widgetId, MSG91_CONFIG.tokenAuth);
      isInitialized = true;
      console.log('✅ MSG91 SendOTP Widget initialized with Live Widget ID: 3668766f6a71323234393034');
    } catch (e) {
      console.error('❌ Failed to initialize MSG91 Widget:', e);
    }
  }
};

export const Msg91OtpService = {
  /**
   * Send OTP via MSG91 SendOTP Widget
   * @param mobileOrEmail e.g. "919810012345" or "parent@crayonboxschool.com"
   */
  sendOTP: async (mobileOrEmail: string) => {
    await initMsg91Widget();
    // Clean identifier (strip + or spaces)
    let identifier = mobileOrEmail.replace(/[^0-9a-zA-Z@._-]/g, '');
    // Ensure 91 country code prefix for 10 digit Indian numbers
    if (/^\d{10}$/.test(identifier)) {
      identifier = `91${identifier}`;
    }
    try {
      const response = await OTPWidget.sendOTP({ identifier });
      console.log('📨 MSG91 sendOTP response:', response);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ MSG91 sendOTP error:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  },

  /**
   * Verify OTP via MSG91 SendOTP Widget
   * @param reqId Request ID from sendOTP response
   * @param otp 4 or 6 digit OTP entered by user
   */
  verifyOTP: async (reqId: string, otp: string) => {
    await initMsg91Widget();
    try {
      const response = await OTPWidget.verifyOTP({ reqId, otp });
      console.log('🔐 MSG91 verifyOTP response:', response);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ MSG91 verifyOTP error:', error);
      return { success: false, error: error.message || 'Invalid OTP entered' };
    }
  },

  /**
   * Retry sending OTP (SMS / WhatsApp / Voice Call)
   */
  retryOTP: async (reqId: string, channel: 'SMS' | 'WHATSAPP' | 'VOICE' = 'SMS') => {
    await initMsg91Widget();
    const retryChannel = channel === 'WHATSAPP' ? 12 : channel === 'VOICE' ? 13 : 11;
    try {
      const response = await OTPWidget.retryOTP({ reqId, retryChannel });
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to retry OTP' };
    }
  },
};
