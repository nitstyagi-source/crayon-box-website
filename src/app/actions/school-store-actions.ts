"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export interface StoreKit {
  id: string;
  grade: string;
  title: string;
  description: string;
  price: number;
  items_included: string[];
  in_stock: number;
}

export interface StoreOrder {
  id: string;
  order_number: string;
  student_name: string;
  grade: string;
  parent_name: string;
  parent_phone: string;
  kit_title: string;
  total_amount: number;
  pickup_slot: string;
  status: 'READY_FOR_PICKUP' | 'FULFILLED' | 'PROCESSING';
  created_at: string;
}

const DEFAULT_KITS: StoreKit[] = [
  {
    id: 'kit-c1',
    grade: 'Class 1',
    title: 'Class 1 Complete Annual Academic Bundle',
    description: 'Includes complete NCERT textbook set, 8 four-line notebooks, drawing sketch pad, crayons, summer uniform set (2 shirts, 2 shorts/skirts), house t-shirt, and school badge.',
    price: 4850,
    items_included: [
      'NCERT Class 1 Complete Book Set (English, Hindi, Math, EVS)',
      '8 Special 4-Line Writing Practice Notebooks',
      'Crayon Box School Summer Uniform (2 Sets)',
      'House Activity T-Shirt & Sports Cap',
      'Art & Craft Origami & Non-Toxic Crayons Kit'
    ],
    in_stock: 45
  },
  {
    id: 'kit-c3',
    grade: 'Class 3',
    title: 'Class 3 Complete Annual Academic Bundle',
    description: 'Includes standard NCERT textbook set, 10 single-line notebooks, geometry ruler set, summer uniform set (2 pairs), house polo, and school sports kit.',
    price: 5400,
    items_included: [
      'NCERT Class 3 Complete Book Set (5 Subjects)',
      '10 Ruled Exercise Notebooks with School Crest',
      'Summer Uniform Pair with Blazer Crest',
      'House Sports Track & PE Polo',
      'Stationery Starter Pack (Pencils, Erasers, Ruler)'
    ],
    in_stock: 38
  },
  {
    id: 'kit-c5',
    grade: 'Class 5',
    title: 'Class 5 Complete Annual Academic Bundle',
    description: 'Includes full NCERT curriculum textbooks, 12 notebooks, Oxford Mini English-Hindi Dictionary, lab manual, and 2 uniform pairs.',
    price: 6200,
    items_included: [
      'NCERT Class 5 Complete Textbook Set (6 Subjects)',
      '12 Register-size Spiral/Ruled Notebooks',
      'School Lab Practical Record Book',
      'Complete Uniform Sets (Summer Formal & PE)',
      'Mathematical Instrument Geometry Box'
    ],
    in_stock: 52
  }
];

const DEFAULT_ORDERS: StoreOrder[] = [
  {
    id: 'ord-01',
    order_number: 'CBS-STR-2026-081',
    student_name: 'Aarav Sharma',
    grade: 'Class 5',
    parent_name: 'Rajesh Sharma',
    parent_phone: '+91 98112 34567',
    kit_title: 'Class 5 Complete Annual Academic Bundle',
    total_amount: 6200,
    pickup_slot: 'Saturday 09:00 AM - 11:00 AM (Auditorium Gate)',
    status: 'READY_FOR_PICKUP',
    created_at: new Date(Date.now() - 1000 * 3600 * 4).toISOString()
  },
  {
    id: 'ord-02',
    order_number: 'CBS-STR-2026-082',
    student_name: 'Ananya Verma',
    grade: 'Class 3',
    parent_name: 'Vikram Verma',
    parent_phone: '+91 98112 99887',
    kit_title: 'Class 3 Complete Annual Academic Bundle',
    total_amount: 5400,
    pickup_slot: 'Saturday 11:00 AM - 01:00 PM (Auditorium Gate)',
    status: 'READY_FOR_PICKUP',
    created_at: new Date(Date.now() - 1000 * 3600 * 8).toISOString()
  }
];

export async function getStoreInventoryAction(): Promise<{ success: boolean; kits: StoreKit[]; orders: StoreOrder[]; error?: string }> {
  try {
    return { success: true, kits: DEFAULT_KITS, orders: DEFAULT_ORDERS };
  } catch (err: any) {
    return { success: false, kits: [], orders: [], error: err.message };
  }
}

export async function createStoreOrderAction(payload: {
  kitId: string;
  studentName: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  pickupSlot: string;
}): Promise<{ success: boolean; order?: StoreOrder; error?: string }> {
  try {
    const kit = DEFAULT_KITS.find((k) => k.id === payload.kitId) || DEFAULT_KITS[0];
    const newOrder: StoreOrder = {
      id: `ord-${Date.now()}`,
      order_number: `CBS-STR-${Date.now().toString().slice(-6)}`,
      student_name: payload.studentName,
      grade: payload.grade,
      parent_name: payload.parentName,
      parent_phone: payload.parentPhone,
      kit_title: kit.title,
      total_amount: kit.price,
      pickup_slot: payload.pickupSlot,
      status: 'READY_FOR_PICKUP',
      created_at: new Date().toISOString()
    };

    if (kit.in_stock > 0) {
      kit.in_stock -= 1;
    }

    DEFAULT_ORDERS.unshift(newOrder);

    try {
      revalidatePath('/admin/procurement');
    } catch (_) {}

    return { success: true, order: newOrder };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markOrderFulfilledAction(orderId: string): Promise<{ success: boolean }> {
  const ord = DEFAULT_ORDERS.find((o) => o.id === orderId);
  if (ord) {
    ord.status = 'FULFILLED';
    try {
      revalidatePath('/admin/procurement');
    } catch (_) {}
  }
  return { success: true };
}
