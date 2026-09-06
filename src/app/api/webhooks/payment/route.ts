import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay webhook secret not configured.' }, { status: 500 });
    }

    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

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
      
      // Look up invoice via payment notes or gateway order_id
      let invoiceId = payment.notes?.invoice_id;

      // 4. Update Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (!invoiceId && orderId) {
        const { data: inv } = await supabase
          .from('student_invoices')
          .select('id')
          .eq('gateway_order_id', orderId)
          .maybeSingle();
        if (inv) {
          invoiceId = inv.id;
        }
      }

      if (invoiceId) {
        await supabase.from('student_invoices')
          .update({ status: 'Paid', amount_paid: payment.amount / 100 })
          .eq('id', invoiceId);
      } else {
        console.warn(`Payment captured (${payment.id}) but no associated invoice found for order ${orderId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
