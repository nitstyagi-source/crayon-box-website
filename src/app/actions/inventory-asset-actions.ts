"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({ connectionString });
  }
  return globalPool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. GET FIXED ASSETS & INVENTORY DASHBOARD
// -------------------------------------------------------------
export async function getFixedAssetsInventoryDashboardAction(params: {
  category?: string;
  condition?: string;
} = {}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Fetch Fixed Assets
    let assetQuery = `SELECT * FROM public.assets WHERE 1=1`;
    const assetValues: any[] = [];

    if (params?.category && params.category !== 'ALL') {
      assetValues.push(params.category);
      assetQuery += ` AND category = $${assetValues.length}`;
    }

    assetQuery += ` ORDER BY created_at DESC`;
    const assetsRes = await client.query(assetQuery, assetValues);

    const assets = assetsRes.rows.map((a: any) => ({
      ...a,
      purchase_date: safeDateStr(a.purchase_date),
      warranty_expiry: safeDateStr(a.warranty_expiry),
      purchase_cost: Number(a.purchase_cost || 0),
      accumulated_depreciation: Number(a.accumulated_depreciation || 0),
      current_book_value: Number(a.current_book_value || 0),
      annualDepreciation: a.useful_life_years > 0
        ? Math.round((Number(a.purchase_cost || 0) - Number(a.salvage_value || 0)) / a.useful_life_years)
        : 0
    }));

    // 2. Fetch Consumable Stockroom Items
    const consRes = await client.query(`
      SELECT * FROM public.consumable_inventory ORDER BY item_name ASC
    `);
    const consumables = consRes.rows.map((c: any) => ({
      ...c,
      current_stock: Number(c.current_stock),
      reorder_threshold: Number(c.reorder_threshold),
      unit_price: Number(c.unit_price),
      totalValue: Number(c.current_stock) * Number(c.unit_price),
      isLowStock: Number(c.current_stock) <= Number(c.reorder_threshold)
    }));

    // Compute Metrics
    const totalOriginalCost = assets.reduce((acc: number, cur: any) => acc + cur.purchase_cost, 0);
    const totalAccumulatedDep = assets.reduce((acc: number, cur: any) => acc + cur.accumulated_depreciation, 0);
    const totalNetBookValue = assets.reduce((acc: number, cur: any) => acc + cur.current_book_value, 0);
    const totalConsumableVal = consumables.reduce((acc: number, cur: any) => acc + cur.totalValue, 0);

    const counts = {
      totalAssetCount: assets.length,
      totalOriginalCost,
      totalAccumulatedDep,
      totalNetBookValue,
      consumablesCount: consumables.length,
      lowStockAlerts: consumables.filter((c: any) => c.isLowStock).length,
      totalConsumableVal
    };

    return { success: true, assets, consumables, counts };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      assets: [],
      consumables: [],
      counts: { totalAssetCount: 0, totalOriginalCost: 0, totalAccumulatedDep: 0, totalNetBookValue: 0, consumablesCount: 0, lowStockAlerts: 0, totalConsumableVal: 0 }
    };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. REGISTER NEW FIXED ASSET
// -------------------------------------------------------------
export async function registerNewFixedAssetAction(params: {
  name: string;
  category: string;
  location: string;
  purchaseCost: number;
  usefulLifeYears?: number;
  salvageValue?: number;
  vendorName?: string;
  condition?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const {
      name,
      category,
      location,
      purchaseCost,
      usefulLifeYears = 5,
      salvageValue = Math.round(purchaseCost * 0.05),
      vendorName = 'Direct Vendor Procurement',
      condition = 'EXCELLENT'
    } = params;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const skuCode = `AST-${category.slice(0, 3).toUpperCase()}-2026-${randomSuffix}`;
    const today = new Date().toISOString().split('T')[0];
    const initialDep = Math.round((purchaseCost - salvageValue) / usefulLifeYears * 0.5);
    const initialBook = purchaseCost - initialDep;

    const insertRes = await client.query(`
      INSERT INTO public.assets (
        campus_id, category, name, sku_code, qr_hash,
        condition, location, is_available, purchase_date,
        purchase_cost, useful_life_years, salvage_value,
        accumulated_depreciation, current_book_value, vendor_name,
        created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3, $3,
        $4, $5, true, $6,
        $7, $8, $9,
        $10, $11, $12, NOW()
      )
      RETURNING *
    `, [
      category, name, skuCode, condition, location,
      today, purchaseCost, usefulLifeYears, salvageValue,
      initialDep, initialBook, vendorName
    ]);

    safeRevalidate('/admin/inventory');

    return {
      success: true,
      message: `✓ Fixed asset "${name}" registered with tag ${skuCode}!`,
      asset: insertRes.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. DISBURSE CONSUMABLE STOCK ITEM
// -------------------------------------------------------------
export async function recordStockroomDisbursementAction(params: {
  itemId: string;
  quantity: number;
  disbursedTo: string;
  department: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { itemId, quantity, disbursedTo, department } = params;

    const itemRes = await client.query(`
      SELECT * FROM public.consumable_inventory WHERE id = $1
    `, [itemId]);

    if (itemRes.rows.length === 0) {
      return { success: false, error: 'Item not found in stockroom.' };
    }

    const item = itemRes.rows[0];
    if (item.current_stock < quantity) {
      return { success: false, error: `Insufficient stock. Current: ${item.current_stock}, Requested: ${quantity}` };
    }

    const updatedStock = item.current_stock - quantity;
    const isLow = updatedStock <= item.reorder_threshold;

    await client.query(`
      UPDATE public.consumable_inventory
      SET current_stock = $1, status = $2
      WHERE id = $3
    `, [updatedStock, isLow ? 'LOW_STOCK' : 'IN_STOCK', itemId]);

    safeRevalidate('/admin/inventory');

    return {
      success: true,
      message: `✓ Disbursed ${quantity} ${item.unit_of_measure} of ${item.item_name} to ${disbursedTo} (${department})!`,
      remainingStock: updatedStock
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
