import pg from "pg";

export interface SendWhatsAppParams {
  recipientPhone: string;
  recipientName?: string;
  studentName?: string;
  message: string;
  templateName?: string;
  templateVariables?: Record<string, string>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  error?: string;
  waLink?: string;
}

function getPool() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  return new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export class WhatsAppService {
  public static cleanPhoneNumber(phone: string): string {
    let clean = (phone || "").replace(/[^0-9]/g, "");
    if (clean.length === 10) {
      clean = "91" + clean; // Default to India (+91)
    }
    return clean;
  }

  /**
   * Send WhatsApp message via MSG91 WhatsApp API or Meta Cloud API
   */
  public static async sendMessage(params: SendWhatsAppParams): Promise<WhatsAppSendResult> {
    const cleanPhone = this.cleanPhoneNumber(params.recipientPhone);
    const msg91AuthKey = process.env.MSG91_AUTH_KEY || process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || "319435TL9QVRfp6n6a89bdeaP1";
    const metaToken = process.env.WHATSAPP_API_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let provider = "MSG91_WHATSAPP";
    let status: 'SENT' | 'DELIVERED' | 'FAILED' = 'SENT';
    let providerResponse: any = null;
    let errorMsg: string | undefined;

    // 1. If Meta Cloud API is configured
    if (metaToken && metaPhoneId) {
      provider = "META_WHATSAPP_CLOUD";
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${metaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: { body: params.message },
          }),
        });
        providerResponse = await metaRes.json();
        if (!metaRes.ok) {
          status = 'FAILED';
          errorMsg = providerResponse.error?.message || "Meta WhatsApp API Error";
        }
      } catch (err: any) {
        status = 'FAILED';
        errorMsg = err.message;
      }
    } 
    // 2. MSG91 WhatsApp Outbound API
    else if (msg91AuthKey) {
      provider = "MSG91_WHATSAPP";
      try {
        const msg91Res = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/", {
          method: "POST",
          headers: {
            "authkey": msg91AuthKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            integrated_number: "919811102008",
            content_type: "text",
            payload: {
              to: cleanPhone,
              type: "text",
              text: { body: params.message }
            }
          }),
        });
        providerResponse = await msg91Res.json().catch(() => ({ status: "submitted" }));
      } catch (err: any) {
        providerResponse = { note: "MSG91 API Dispatched", error: err.message };
      }
    }

    // Direct universal fallback link
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(params.message)}`;

    // Log message into PostgreSQL
    const pool = getPool();
    try {
      const insertRes = await pool.query(`
        INSERT INTO public.whatsapp_messages_log (
          recipient_phone,
          recipient_name,
          student_name,
          message_body,
          template_name,
          status,
          provider,
          provider_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING id;
      `, [
        cleanPhone,
        params.recipientName || 'Parent',
        params.studentName || 'Student',
        params.message,
        params.templateName || 'CUSTOM_DIRECT',
        status,
        provider,
        JSON.stringify(providerResponse || { waLink })
      ]);

      const logId = insertRes.rows[0]?.id;
      return {
        success: status !== 'FAILED',
        messageId: logId,
        provider,
        status,
        waLink,
        error: errorMsg
      };
    } catch (dbErr: any) {
      console.error("Database log error in WhatsAppService:", dbErr);
      return {
        success: true,
        provider,
        status: 'SENT',
        waLink
      };
    } finally {
      await pool.end();
    }
  }

  /**
   * Get communication history
   */
  public static async getLogs(limit: number = 100) {
    const pool = getPool();
    try {
      const res = await pool.query(`
        SELECT * FROM public.whatsapp_messages_log
        ORDER BY created_at DESC
        LIMIT $1;
      `, [limit]);
      return res.rows;
    } catch (e: any) {
      console.error("Error fetching WhatsApp logs:", e);
      return [];
    } finally {
      await pool.end();
    }
  }
}
