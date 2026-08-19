"use server";

import Razorpay from "razorpay";
import { getSupabaseAdmin } from "./finance-core"; // We will export this from finance-core

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export async function createRazorpayOrder(invoiceId: string, amount: number) {
  try {
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
