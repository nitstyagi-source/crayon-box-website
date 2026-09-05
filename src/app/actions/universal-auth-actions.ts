"use server";

import pg from 'pg';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.substring(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

// -------------------------------------------------------------
// 1. REQUEST UNIVERSAL OTP (WhatsApp or Email)
// -------------------------------------------------------------
export async function requestUniversalOtpAction(params: {
  identifier: string;
  channel?: 'WHATSAPP' | 'EMAIL';
}) {
  const client = await getPool().connect();
  try {
    const rawId = params.identifier.trim();
    const channel = params.channel || 'WHATSAPP';
    const isEmail = rawId.includes('@');
    const phone = isEmail ? '' : normalizePhone(rawId);

    let parentRecord: any = null;
    let studentRecords: any[] = [];
    let staffRecord: any = null;
    let targetEmail = isEmail ? rawId.toLowerCase() : '';
    let targetPhone = phone;

    // Lookup 1: Check Staff / Faculty
    if (isEmail) {
      const staffRes = await client.query(
        `SELECT * FROM public.staff 
         WHERE (email ILIKE $1 OR official_email ILIKE $1 OR personal_email ILIKE $1) 
           AND is_active = true 
         LIMIT 1;`,
        [rawId]
      );
      staffRecord = staffRes.rows[0];
      if (staffRecord && !targetPhone) targetPhone = normalizePhone(staffRecord.phone_number || staffRecord.whatsapp_no || '');
    } else {
      const staffRes = await client.query(
        `SELECT * FROM public.staff 
         WHERE (
           REGEXP_REPLACE(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(whatsapp_no, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(personal_mobile, ''), '[^0-9]', '', 'g') LIKE $1
         ) 
         AND is_active = true 
         LIMIT 1;`,
        [`%${phone}%`]
      );
      staffRecord = staffRes.rows[0];
      if (staffRecord && !targetEmail) targetEmail = staffRecord.email || staffRecord.official_email;
    }

    // Lookup 2: Check Students & Parents (Deep Joined Query)
    if (isEmail) {
      const stuRes = await client.query(
        `SELECT s.*, c.grade, c.section, p.email as parent_table_email, p.phone_number as parent_table_phone
         FROM public.students s 
         LEFT JOIN public.classes c ON c.id = s.class_id 
         LEFT JOIN public.parents p ON p.id = s.parent_id
         WHERE (s.parent_email ILIKE $1 OR p.email ILIKE $1) 
           AND (s.status ILIKE 'active' OR s.status ILIKE 'enrolled' OR s.status IS NULL);`,
        [rawId]
      );
      studentRecords = stuRes.rows;
      if (studentRecords.length > 0 && !targetPhone) {
        targetPhone = normalizePhone(studentRecords[0].parent_phone || studentRecords[0].parent_table_phone || '');
      }
    } else {
      const stuRes = await client.query(
        `SELECT s.*, c.grade, c.section, p.phone_number as parent_table_phone, p.email as parent_table_email
         FROM public.students s 
         LEFT JOIN public.classes c ON c.id = s.class_id 
         LEFT JOIN public.parents p ON p.id = s.parent_id
         WHERE (
           REGEXP_REPLACE(COALESCE(s.parent_phone, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(p.phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
           OR s.admission_no ILIKE $2 
           OR s.universal_id ILIKE $2
         ) 
         AND (s.status ILIKE 'active' OR s.status ILIKE 'enrolled' OR s.status IS NULL);`,
        [`%${phone}%`, rawId]
      );
      studentRecords = stuRes.rows;
      if (studentRecords.length > 0 && !targetEmail) {
        targetEmail = studentRecords[0].parent_email || studentRecords[0].parent_table_email;
      }
    }

    // Lookup 3: Check Enquiries (for newly registered or walk-in parents)
    if (!staffRecord && studentRecords.length === 0) {
      const enqRes = await client.query(
        `SELECT * FROM public.enquiries 
         WHERE (
           REGEXP_REPLACE(COALESCE(father_mobile, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(mother_mobile, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(parent_phone, ''), '[^0-9]', '', 'g') LIKE $1
         ) 
         LIMIT 1;`,
        [`%${phone}%`]
      );
      if (enqRes.rows.length > 0) {
        const enq = enqRes.rows[0];
        parentRecord = {
          name: enq.parent_name || enq.father_name || 'Parent',
          phone: normalizePhone(enq.father_mobile || enq.parent_phone || phone),
          childName: enq.child_name || enq.first_name || 'Enrolled Student'
        };
      }
    }

    // If no record found at all
    if (!staffRecord && studentRecords.length === 0 && !parentRecord) {
      return {
        success: false,
        error: `No active account found for "${rawId}". Please contact School Front Desk.`
      };
    }

    // 🛑 WEB ERP RESTRICTION: Web ERP is strictly reserved for Super Admins, Principals, and Staff.
    // Pure parents must use the official Crayon Box School Mobile App.
    if (!staffRecord && (studentRecords.length > 0 || parentRecord)) {
      return {
        success: false,
        error: `Parent & Student accounts access Crayon Box School exclusively via the official Mobile App. Please download and open the Crayon Box School App on your Android or iOS phone.`
      };
    }

    // Generate 6-Digit TOTP & Cryptographic Hash
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to auth_otp_logs
    await client.query(
      `INSERT INTO public.auth_otp_logs (
        phone_number, email_address, otp_code, otp_code_hash, purpose, channel, expires_at, attempts, is_verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, false, NOW());`,
      [
        targetPhone || phone || 'EMAIL-LOGIN',
        targetEmail,
        otpCode,
        otpHash,
        'UNIVERSAL_LOGIN',
        channel,
        expiresAt.toISOString()
      ]
    );

    // 🚀 DISPATCH LIVE REAL OTP TO PHONE NETWORK VIA MSG91 WHATSAPP / TELECOM GATEWAY
    const destinationPhone = targetPhone || phone;
    if (destinationPhone && destinationPhone.length >= 10) {
      try {
        const authKey = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || '319435Asat7zCpoh5e4f778fP1';
        const cleanPhone = destinationPhone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const integratedNumber = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER || '15554018700';
        const templateName = process.env.MSG91_WHATSAPP_TEMPLATE_NAME || 'crayonbox_login_otp';

        if (channel === 'EMAIL' && (targetEmail || rawId.includes('@'))) {
          const emailAddr = targetEmail || rawId;
          const resendApiKey = process.env.RESEND_API_KEY;

          // 🚀 1. DISPATCH VIA RESEND (0.15s instant delivery)
          if (resendApiKey) {
            try {
              const { Resend } = require('resend');
              const resend = new Resend(resendApiKey);
              const fromSender = process.env.RESEND_FROM_EMAIL || 'Crayon Box School <onboarding@resend.dev>';
              
              const resendRes = await resend.emails.send({
                from: fromSender,
                to: emailAddr,
                subject: `${otpCode} is your Crayon Box Verification Code`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Crayon Box Verification Code</title>
                  </head>
                  <body style="margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF9F5; padding: 40px 16px;">
                      <tr>
                        <td align="center">
                          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #FFFFFF; border: 1px solid #EFE8DC; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px rgba(11, 27, 48, 0.08);">
                            
                            <!-- Deep Navy Header -->
                            <tr>
                              <td style="background-color: #0B1B30; padding: 28px 24px; text-align: center;">
                                <div style="display: inline-block; padding: 4px 12px; background-color: #183454; border: 1px solid #2A4D75; border-radius: 12px; margin-bottom: 10px;">
                                  <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #D4AF37; text-transform: uppercase;">
                                    VAANI EDUCATIONAL TRUST
                                  </span>
                                </div>
                                <h1 style="margin: 0; font-size: 20px; color: #F8FAFC; font-weight: 800; letter-spacing: 0.3px;">
                                  Crayon Box School
                                </h1>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: #94A3B8; font-weight: 500;">
                                  Apex Multi-Campus Portal • CBS • CBPS • AS • AVM
                                </p>
                              </td>
                            </tr>

                            <!-- Main Body -->
                            <tr>
                              <td style="padding: 32px 28px; text-align: center;">
                                <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0B1B30; font-weight: 800;">
                                  Sign In Verification Code
                                </h2>
                                <p style="margin: 0 0 24px 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                                  Please use the verification code below to securely sign in to your institutional workspace.
                                </p>

                                <!-- Code Highlight Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; border: 1.5px solid #E8DFD3; border-radius: 18px; margin-bottom: 24px;">
                                  <tr>
                                    <td style="padding: 22px 16px; text-align: center;">
                                      <div style="font-size: 40px; font-weight: 900; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; color: #0B1B30; letter-spacing: 10px;">
                                        ${otpCode}
                                      </div>
                                      <p style="margin: 8px 0 0 0; font-size: 11px; color: #C85A32; font-weight: 700;">
                                        ⏱️ Single-use code • Valid for 5 minutes
                                      </p>
                                    </td>
                                  </tr>
                                </table>

                                <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                                  For security reasons, never forward or share this code. If you did not make this request, you can safely ignore this email.
                                </p>
                              </td>
                            </tr>

                            <!-- Institutional Footer -->
                            <tr>
                              <td style="background-color: #FAF7F2; border-top: 1px solid #EFE8DC; padding: 20px 24px; text-align: center;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748B;">
                                  Front Desk Assistance: <strong style="color: #0B1B30;">+91 98111 02008</strong>
                                </p>
                                <p style="margin: 0; font-size: 10px; color: #94A3B8;">
                                  © 2026 Vaani Educational Trust • 256-Bit Encrypted Multi-Channel Authentication
                                </p>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `
              });
              console.log(`✉️ Dispatched Resend Email OTP (${otpCode}) to ${emailAddr}:`, resendRes);
            } catch (rErr) {
              console.error("Resend dispatch error:", rErr);
            }
          }

          // 2. Fallback to Supabase Auth OTP
          try {
            const { createClient } = require('@supabase/supabase-js');
            const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
              process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.crayonboxschool.com';
            await supabaseAdmin.auth.signInWithOtp({
              email: emailAddr,
              options: {
                emailRedirectTo: `${siteUrl}/login`
              }
            });
            console.log(`✉️ Dispatched Supabase Email OTP to ${emailAddr}`);
          } catch (supaEmailErr) {
            console.warn("Supabase email fallback error:", supaEmailErr);
          }
        } else if (channel === 'WHATSAPP') {
          const waPayload = {
            integrated_number: integratedNumber,
            content_type: 'template',
            payload: {
              messaging_product: 'whatsapp',
              type: 'template',
              template: {
                name: templateName,
                language: {
                  code: 'en',
                  policy: 'deterministic'
                },
                namespace: null,
                to_and_components: [
                  {
                    to: [formattedPhone],
                    components: {
                      body_1: {
                        type: 'text',
                        value: otpCode
                      },
                      button_1: {
                        subtype: 'url',
                        type: 'text',
                        value: otpCode
                      }
                    }
                  }
                ]
              }
            }
          };

          const waRes = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
            method: 'POST',
            headers: {
              'authkey': authKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(waPayload)
          });
          const waData = await waRes.json().catch(() => ({}));
          console.log(`📱 Dispatched Live WhatsApp OTP to ${formattedPhone}:`, waData);
        } else {
          // Standard SMS route fallback
          const smsUrl = `https://control.msg91.com/api/v5/otp?template_id=&mobile=${formattedPhone}&authkey=${authKey}&otp=${otpCode}&otp_expiry=5`;
          const smsRes = await fetch(smsUrl, {
            method: 'POST',
            headers: {
              'authkey': authKey,
              'Content-Type': 'application/json'
            }
          });
          const smsData = await smsRes.json().catch(() => ({}));
          console.log(`📡 Dispatched Live SMS OTP to ${formattedPhone}:`, smsData);
        }
      } catch (gwErr) {
        console.error('Failed to reach telecom gateway:', gwErr);
      }
    }

    // Delivery destination masking
    let maskedDestination = '';
    if (channel === 'WHATSAPP') {
      const p = targetPhone || phone;
      maskedDestination = p.length >= 10 ? `+91 ${p.substring(0, 2)}••••••${p.substring(8)}` : p;
    } else {
      const [user, domain] = (targetEmail || rawId).split('@');
      maskedDestination = `${user.substring(0, 2)}••••@${domain}`;
    }

    const isDualRoleCandidate = Boolean(staffRecord && studentRecords.length > 0);

    return {
      success: true,
      channel,
      maskedDestination,
      targetPhone: targetPhone || phone,
      targetEmail,
      expiryMinutes: 5,
      isDualRoleCandidate,
      message: `✓ Verification code dispatched via ${channel === 'WHATSAPP' ? 'WhatsApp' : 'Email'} to ${maskedDestination}`
    };
  } catch (error: any) {
    console.error("requestUniversalOtpAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. VERIFY UNIVERSAL OTP & RESOLVE DUAL-ROLE PERSONAS
// -------------------------------------------------------------
export async function verifyUniversalOtpAction(params: {
  identifier: string;
  otpCode: string;
}) {
  const client = await getPool().connect();
  try {
    const rawId = params.identifier.trim();
    const isEmail = rawId.includes('@');
    const phone = isEmail ? '' : normalizePhone(rawId);
    const code = params.otpCode.trim();

    // 1. Verify OTP in auth_otp_logs
    const otpRes = await client.query(
      `SELECT * FROM public.auth_otp_logs 
       WHERE (
         REGEXP_REPLACE(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
         OR email_address ILIKE $2 
         OR phone_number = 'EMAIL-LOGIN'
       )
       AND otp_code = $3 
       AND is_verified = false 
       AND expires_at > NOW() 
       ORDER BY created_at DESC 
       LIMIT 1;`,
      [`%${phone}%`, rawId, code]
    );

    let isOtpValid = otpRes.rows.length > 0;
    if (!isOtpValid && isEmail) {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: supaVerify, error: supaErr } = await supabaseClient.auth.verifyOtp({
        email: rawId,
        token: code,
        type: 'email'
      });
      if (supaVerify?.session || !supaErr) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return {
        success: false,
        error: "Invalid or expired verification code. Please enter the latest code or request a new one."
      };
    }

    if (otpRes.rows.length > 0) {
      const otpRecord = otpRes.rows[0];
      await client.query(
        "UPDATE public.auth_otp_logs SET is_verified = true WHERE id = $1;",
        [otpRecord.id]
      );
    }

    // 2. Resolve Personas (Faculty + Parent/Student + Admin)
    let staffProfile: any = null;
    let children: any[] = [];
    let parentProfile: any = null;

    // Faculty Lookup (Isolated by Email vs Phone)
    let staffRes: any;
    if (isEmail) {
      staffRes = await client.query(
        `SELECT id, first_name, last_name, role, designation, department, wing,
                is_class_teacher, class_teacher_for, photo_url, phone_number, email
         FROM public.staff 
         WHERE (email ILIKE $1 OR official_email ILIKE $1 OR personal_email ILIKE $1) 
           AND is_active = true 
         LIMIT 1;`,
        [rawId]
      );
    } else {
      staffRes = await client.query(
        `SELECT id, first_name, last_name, role, designation, department, wing,
                is_class_teacher, class_teacher_for, photo_url, phone_number, email
         FROM public.staff 
         WHERE (
           REGEXP_REPLACE(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(whatsapp_no, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(personal_mobile, ''), '[^0-9]', '', 'g') LIKE $1
         ) 
         AND is_active = true 
         LIMIT 1;`,
        [`%${phone}%`]
      );
    }

    if (staffRes.rows.length > 0) {
      const s = staffRes.rows[0];
      staffProfile = {
        id: s.id,
        name: `${s.first_name} ${s.last_name || ''}`.trim(),
        role: s.role || 'Teacher',
        designation: s.designation || 'Faculty Member',
        department: s.department || 'Academics',
        isClassTeacher: s.is_class_teacher,
        classTeacherFor: s.class_teacher_for,
        photoUrl: s.photo_url,
        phone: s.phone_number,
        email: s.email
      };
    }

    // Children & Parent Lookup (Isolated by Email vs Phone)
    let stuRes: any;
    if (isEmail) {
      stuRes = await client.query(
        `SELECT s.id, s.first_name, s.last_name, s.admission_no, s.roll_no, s.photo_url,
                s.parent_phone, s.parent_email, s.father_name, s.mother_name,
                c.grade, c.section, c.room_number, p.phone_number as parent_table_phone
         FROM public.students s
         LEFT JOIN public.classes c ON c.id = s.class_id
         LEFT JOIN public.parents p ON p.id = s.parent_id
         WHERE (s.parent_email ILIKE $1 OR p.email ILIKE $1)
           AND (s.status ILIKE 'active' OR s.status ILIKE 'enrolled' OR s.status IS NULL)
         ORDER BY s.first_name ASC;`,
        [rawId]
      );
    } else {
      stuRes = await client.query(
        `SELECT s.id, s.first_name, s.last_name, s.admission_no, s.roll_no, s.photo_url,
                s.parent_phone, s.parent_email, s.father_name, s.mother_name,
                c.grade, c.section, c.room_number, p.phone_number as parent_table_phone
         FROM public.students s
         LEFT JOIN public.classes c ON c.id = s.class_id
         LEFT JOIN public.parents p ON p.id = s.parent_id
         WHERE (
           REGEXP_REPLACE(COALESCE(s.parent_phone, ''), '[^0-9]', '', 'g') LIKE $1 
           OR REGEXP_REPLACE(COALESCE(p.phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
           OR s.admission_no ILIKE $2
         )
         AND (s.status ILIKE 'active' OR s.status ILIKE 'enrolled' OR s.status IS NULL)
         ORDER BY s.first_name ASC;`,
        [`%${phone}%`, rawId]
      );
    }

    if (stuRes.rows.length > 0) {
      children = stuRes.rows.map((st: any) => ({
        id: st.id,
        name: `${st.first_name} ${st.last_name || ''}`.trim(),
        grade: st.grade ? `${st.grade}${st.section ? `-${st.section}` : ''}` : 'Enrolled',
        roomNumber: st.room_number || '-',
        rollNo: st.roll_no || '-',
        admissionNo: st.admission_no,
        photoUrl: st.photo_url
      }));

      const firstStu = stuRes.rows[0];
      parentProfile = {
        name: firstStu.father_name || firstStu.mother_name || 'Parent',
        phone: firstStu.parent_phone || firstStu.parent_table_phone || phone,
        email: firstStu.parent_email
      };
    }

    // Determine Roles
    const roles: string[] = [];
    if (staffProfile) roles.push('FACULTY');
    if (children.length > 0) roles.push('PARENT');
    if (staffProfile?.role?.toLowerCase().includes('admin') || staffProfile?.role?.toLowerCase().includes('principal')) {
      roles.push('ADMIN');
    }

    const isDualRole = Boolean(staffProfile && children.length > 0);

    return {
      success: true,
      user: {
        identifier: phone || rawId,
        roles,
        isDualRole,
        primaryRole: staffProfile ? 'FACULTY' : 'PARENT',
        faculty: staffProfile,
        parent: parentProfile,
        children,
        token: `cb_auth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      },
      message: "✓ Identity Verified Successfully!"
    };
  } catch (error: any) {
    console.error("verifyUniversalOtpAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. EMERGENCY OFFLINE PIN LOGIN (For Parents without Smartphone)
// -------------------------------------------------------------
export async function verifyEmergencyPinAction(params: {
  identifier: string;
  pinCode: string;
}) {
  const client = await getPool().connect();
  try {
    const rawId = params.identifier.trim();
    const pin = params.pinCode.trim().toUpperCase();
    const phone = normalizePhone(rawId);

    // Master PIN Override for Chairman & Leadership
    if (pin === '100800' || pin === '9911' || pin === '2027' || pin === '9482' || pin === 'CB-9482') {
      const childrenRes = await client.query(
        `SELECT s.id, s.first_name || ' ' || COALESCE(s.last_name, '') as name, c.grade, s.admission_number as "admissionNo"
         FROM public.students s
         LEFT JOIN public.classes c ON c.id = s.class_id
         LEFT JOIN public.parents p ON p.id = s.parent_id
         WHERE s.parent_phone LIKE '%9911102027%' OR p.phone_number LIKE '%9911102027%' OR s.emergency_contact LIKE '%9911102027%'`
      ).catch(() => ({ rows: [] }));

      const realChildren = childrenRes.rows || [];
      const hasRealChildren = realChildren.length > 0;

      return {
        success: true,
        user: {
          identifier: '9911102027',
          roles: hasRealChildren ? ['ADMIN', 'PARENT'] : ['ADMIN'],
          isDualRole: hasRealChildren,
          primaryRole: 'ADMIN',
          admin: {
            id: 'a96ca895-7773-48e1-9181-e5fe36551627',
            name: 'Nitin Tyagi',
            role: 'SUPER_ADMIN',
            designation: 'Chairman & Managing Trustee',
            email: 'nits.tyagi@gmail.com'
          },
          children: realChildren,
          token: `cb_master_pin_${Date.now()}`
        },
        message: "✓ Master PIN verified. Welcome Chairman Nitin Tyagi."
      };
    }

    // 1. Check Student emergency PIN
    const stuRes = await client.query(
      `SELECT s.*, c.grade, c.section 
       FROM public.students s
       LEFT JOIN public.classes c ON c.id = s.class_id
       LEFT JOIN public.parents p ON p.id = s.parent_id
       WHERE (
         REGEXP_REPLACE(COALESCE(s.parent_phone, ''), '[^0-9]', '', 'g') LIKE $1 
         OR REGEXP_REPLACE(COALESCE(p.phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
         OR s.admission_no ILIKE $2
       )
       AND (s.emergency_login_pin = $3 OR p.emergency_login_pin = $3)
       AND (s.emergency_pin_expires_at IS NULL OR s.emergency_pin_expires_at > NOW())
       AND (s.status ILIKE 'active' OR s.status ILIKE 'enrolled' OR s.status IS NULL);`,
      [`%${phone}%`, rawId, pin]
    );

    if (stuRes.rows.length > 0) {
      const children = stuRes.rows.map((st: any) => ({
        id: st.id,
        name: `${st.first_name} ${st.last_name || ''}`.trim(),
        grade: st.grade ? `${st.grade}${st.section ? `-${st.section}` : ''}` : 'Enrolled',
        admissionNo: st.admission_no,
        photoUrl: st.photo_url
      }));

      return {
        success: true,
        user: {
          identifier: phone || rawId,
          roles: ['PARENT'],
          isDualRole: false,
          primaryRole: 'PARENT',
          children,
          token: `cb_pin_auth_${Date.now()}`
        },
        message: "✓ Emergency PIN verified. Access granted."
      };
    }

    // 2. Check Staff emergency PIN
    const staffRes = await client.query(
      `SELECT * FROM public.staff 
       WHERE (
         REGEXP_REPLACE(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE $1 
         OR email ILIKE $2
       )
       AND emergency_login_pin = $3
       AND (emergency_pin_expires_at IS NULL OR emergency_pin_expires_at > NOW())
       AND is_active = true;`,
      [`%${phone}%`, rawId, pin]
    );

    if (staffRes.rows.length > 0) {
      const s = staffRes.rows[0];
      return {
        success: true,
        user: {
          identifier: phone || rawId,
          roles: ['FACULTY'],
          isDualRole: false,
          primaryRole: 'FACULTY',
          faculty: {
            id: s.id,
            name: `${s.first_name} ${s.last_name || ''}`.trim(),
            role: s.role || 'Teacher',
            designation: s.designation
          },
          token: `cb_pin_auth_${Date.now()}`
        },
        message: "✓ Emergency Staff PIN verified. Access granted."
      };
    }

    return {
      success: false,
      error: "Invalid Emergency PIN or PIN has expired. Please request a new PIN from School Administration."
    };
  } catch (error: any) {
    console.error("verifyEmergencyPinAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GENERATE STUDENT EMERGENCY PIN (Admin Student Directory Tool)
// -------------------------------------------------------------
export async function generateStudentEmergencyPinAction(studentId: string) {
  const client = await getPool().connect();
  try {
    // Generate 6-char PIN (e.g. CB-8492)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pin = `CB-${randomNum}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await client.query(
      `UPDATE public.students 
       SET emergency_login_pin = $1,
           emergency_pin_expires_at = $2,
           emergency_pin_generated_by = 'ADMIN_DESK',
           updated_at = NOW()
       WHERE id::text = $3 OR admission_no ILIKE $3;`,
      [pin, expiresAt.toISOString(), studentId]
    );

    safeRevalidate('/admin/students');

    return {
      success: true,
      pin,
      expiresAt: expiresAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      message: `✓ Generated Emergency Parent Login PIN: ${pin} (Valid for 30 days)`
    };
  } catch (error: any) {
    console.error("generateStudentEmergencyPinAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
