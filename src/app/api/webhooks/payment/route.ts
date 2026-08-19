import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_secret";

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Parse Body
    const body = JSON.parse(rawBody);

    // 3. Handle specific events (e.g., payment.captured)
    if (body.event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id; 
      
      // We would ideally look up the invoice using the orderId in a mapping table, 
      // but for this example we'll assume we pass internal invoice ID in notes.
      const invoiceId = payment.notes?.invoice_id || "mock-invoice-id";

      // 4. Update Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Example update
      await supabase.from('student_invoices')
        .update({ status: 'Paid', amount_paid: payment.amount / 100 })
        .eq('id', invoiceId);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
