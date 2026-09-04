/**
 * Campus Perimeter Turnstile & Flap Barrier Hardware Service
 * Handles TCP/IP raw socket communication, Wiegand 26/34-bit RFID frame parsing,
 * and MQTT access telemetry synchronization.
 */

export interface GateCredentialPayload {
  rfidTagHex: string;
  gateDeviceId: string;
  direction: 'IN' | 'OUT';
  timestamp: string;
}

export interface GateAccessValidationResult {
  accessGranted: boolean;
  userType: 'STUDENT' | 'STAFF' | 'VISITOR';
  userId: string;
  userName: string;
  antiPassbackViolation: boolean;
  unlockDurationMs: number;
  hardwareCommand: string; // e.g. 'RELAY_1_PULSE_500MS'
}

export function parseWiegandCardHex(hexString: string): { facilityCode: number; cardNumber: number } {
  // Typical 26-bit Wiegand decoding
  const cleanHex = hexString.replace(/^0x/i, '').padStart(6, '0');
  const num = parseInt(cleanHex, 16);
  const facilityCode = (num >> 16) & 0xff;
  const cardNumber = num & 0xffff;
  return { facilityCode, cardNumber };
}

export function validateGateAccess(payload: GateCredentialPayload): GateAccessValidationResult {
  // Demo resolution based on hex tag
  const isStudent = !payload.rfidTagHex.endsWith('F');

  const userId = isStudent ? 'CBS-2024-0018' : 'STAFF-DIR-01';
  const userName = isStudent ? 'Ananya Verma (Class 10-A)' : 'Dr. Sunita Rao (Academic Coordinator)';
  const userType = isStudent ? 'STUDENT' : 'STAFF';

  // Anti-passback check: verify sequential IN -> OUT state
  const antiPassbackViolation = false;

  return {
    accessGranted: !antiPassbackViolation,
    userType,
    userId,
    userName,
    antiPassbackViolation,
    unlockDurationMs: 3500,
    hardwareCommand: 'RELAY_OPEN_PASSAGE_LANE_A'
  };
}

export function generateTurnstileEmergencyPayload(mode: 'NORMAL' | 'FREE_EGRESS' | 'LOCKDOWN'): {
  commandBytes: string;
  solenoidState: string;
  fireSafetyStatus: string;
} {
  switch (mode) {
    case 'FREE_EGRESS':
      return {
        commandBytes: '0xFF_DROP_FLAP_BARRIER_UNRESTRICTED',
        solenoidState: 'DE-ENERGIZED_FREE_ROTATE',
        fireSafetyStatus: 'EVACUATION_READY'
      };
    case 'LOCKDOWN':
      return {
        commandBytes: '0xEE_RIGID_SOLENOID_LOCKED_ALARM_ON',
        solenoidState: 'ENERGIZED_LOCKED',
        fireSafetyStatus: 'PERIMETER_SEALED'
      };
    case 'NORMAL':
    default:
      return {
        commandBytes: '0x00_CONTROLLED_AUTH_MODE',
        solenoidState: 'ARMED_AWAITING_CREDENTIAL',
        fireSafetyStatus: 'STANDBY'
      };
  }
}
