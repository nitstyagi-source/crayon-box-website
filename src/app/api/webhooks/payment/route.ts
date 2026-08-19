import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase Admin client for secure server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy-secret';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature (Razorpay specific)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[WEBHOOK ERROR] Invalid Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // Ensure it's a payment success event
    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      
      // Extract custom metadata passed during checkout
      const invoiceId = paymentEntity.notes?.invoice_id;
      const gatewayTxId = paymentEntity.id;
      const amountPaid = paymentEntity.amount / 100; // Razorpay amounts are in paise

      if (!invoiceId) {
        return NextResponse.json({ error: 'Missing invoice_id in notes' }, { status: 400 });
      }

      console.log(`[WEBHOOK] Processing successful payment for Invoice ${invoiceId}`);

      const supabase = getSupabaseAdmin();

      // 1. Update the transaction status
      const { error: txError } = await supabase
        .from('transactions')
        .update({ 
          status: 'Success', 
          gateway_transaction_id: gatewayTxId 
        })
        .eq('invoice_id', invoiceId);

      if (txError && txError.code !== '42P01') {
        throw new Error(`Failed to update transaction: ${txError.message}`);
      }

      // 2. Update the invoice status
      const { error: invError } = await supabase
        .from('invoices')
        .update({ 
          status: 'Paid',
          amount_paid: amountPaid,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (invError && invError.code !== '42P01') {
        throw new Error(`Failed to update invoice: ${invError.message}`);
      }

      console.log(`[WEBHOOK] Successfully marked Invoice ${invoiceId} as Paid.`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[WEBHOOK ERROR]', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
