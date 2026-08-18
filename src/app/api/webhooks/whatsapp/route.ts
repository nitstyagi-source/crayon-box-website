import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // In production, verify Twilio webhook signature here
    // const signature = request.headers.get('x-twilio-signature');
    
    // Twilio sends data as form-urlencoded by default
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    console.log(`[WhatsApp Webhook] Received message from ${from}: ${body}`);

    // Here we would typically:
    // 1. Look up the parent by phone number
    // 2. Log the incoming message to the DB
    // 3. Trigger an AI bot response or route to an admin dashboard
    
    // const supabase = await createClient();
    // const { data: parent } = await supabase.from('parents').select('*').eq('phone_number', from).single();
    
    // Return a TwiML response acknowledging receipt
    const twiml = `
      <Response>
        <Message>
          <Body>Thank you for contacting Crayon Box School. We have received your message and will reply shortly.</Body>
        </Message>
      </Response>
    `;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
