"use server";

import Razorpay from "razorpay";

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(invoiceId: string, amount: number) {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return { 
        success: false, 
        error: "Payment gateway credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured." 
      };
    }
    // 1. Create order on Razorpay
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: invoiceId, // Track our internal invoice ID
    };
    
    const order = await razorpay.orders.create(options);
    
    // 2. You could technically save the order.id in the DB here if needed
    // But returning it to the client is enough for Checkout.
    return { success: true, orderId: order.id, amount: options.amount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
