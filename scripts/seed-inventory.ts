import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function seedInventory() {
  const client = await pool.connect();
  console.log('⏳ Seeding Institutional Fixed Assets & Consumable Inventory in PostgreSQL...');

  await client.query(`DELETE FROM public.assets;`);
  await client.query(`DELETE FROM public.consumable_inventory;`);

  const mockAssets = [
    {
      name: 'Interactive Smartboard 75" 4K (Newline Interactive)',
      cat: 'IT & Digital Classroom',
      sku: 'AST-IT-2026-001',
      loc: 'Senior Wing - Room 101 (Class 10A)',
      cost: 145000,
      years: 5,
      salvage: 10000,
      dep: 27000,
      book: 118000,
      vendor: 'Newline Interactive India',
      cond: 'EXCELLENT'
    },
    {
      name: 'Dell OptiPlex Core-i7 AI Workstations (Set of 10)',
      cat: 'IT & Digital Classroom',
      sku: 'AST-IT-2026-002',
      loc: 'Computer Science & AI Lab (Room 204)',
      cost: 650000,
      years: 4,
      salvage: 50000,
      dep: 150000,
      book: 500000,
      vendor: 'Dell India Pvt Ltd',
      cond: 'EXCELLENT'
    },
    {
      name: 'Olympus Binocular Research Microscopes (Set of 12)',
      cat: 'Science Laboratory',
      sku: 'AST-LAB-2026-003',
      loc: 'Senior Biology Laboratory',
      cost: 210000,
      years: 7,
      salvage: 15000,
      dep: 27800,
      book: 182200,
      vendor: 'Olympus Scientific India',
      cond: 'GOOD'
    },
    {
      name: 'Telescopic Solar Observatory & Equatorial Mount',
      cat: 'Science Laboratory',
      sku: 'AST-LAB-2026-004',
      loc: 'Astronomy Club Rooftop Observatory',
      cost: 320000,
      years: 10,
      salvage: 20000,
      dep: 30000,
      book: 290000,
      vendor: 'Celestron Optics',
      cond: 'EXCELLENT'
    },
    {
      name: 'Montessori Wooden Sensorial & Mathematical Cabinet',
      cat: 'Montessori Early Years',
      sku: 'AST-MONT-2026-005',
      loc: 'Montessori Activity Wing (Nursery A)',
      cost: 185000,
      years: 6,
      salvage: 10000,
      dep: 29100,
      book: 155900,
      vendor: 'Montessori Guild Crafts',
      cond: 'EXCELLENT'
    },
    {
      name: 'Modular Ergonomic Dual Benches & Desks (Set of 50)',
      cat: 'Campus Furniture',
      sku: 'AST-FURN-2026-006',
      loc: 'Middle School Wing (Rooms 201-205)',
      cost: 290000,
      years: 8,
      salvage: 15000,
      dep: 34300,
      book: 255700,
      vendor: 'Godrej Interio',
      cond: 'GOOD'
    }
  ];

  for (const a of mockAssets) {
    await client.query(`
      INSERT INTO public.assets (
        campus_id, category, name, sku_code, qr_hash,
        condition, location, is_available, purchase_date,
        purchase_cost, useful_life_years, salvage_value,
        accumulated_depreciation, current_book_value, vendor_name,
        warranty_expiry, created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3, $3,
        $4, $5, true, '2025-04-01',
        $6, $7, $8, $9, $10, $11, '2028-03-31', NOW()
      )
    `, [a.cat, a.name, a.sku, a.cond, a.loc, a.cost, a.years, a.salvage, a.dep, a.book, a.vendor]);
  }

  const mockConsumables = [
    { name: 'CBSE Standard A4 Answer Booklets (32 Pages)', cat: 'Examination', uom: 'Bundles (100 pcs)', stock: 450, min: 100, price: 450, loc: 'Central Examination Vault' },
    { name: 'A4 High-Speed Copier Paper (75 GSM)', cat: 'Stationery', uom: 'Reams (500 sheets)', stock: 120, min: 30, price: 280, loc: 'Admin Storekeeper Rack A-1' },
    { name: 'Hydrochloric Acid (HCl Concentrated, AR Grade)', cat: 'Chemistry Lab', uom: 'Litre Bottles', stock: 15, min: 5, price: 650, loc: 'Chemical Safety Locker (Lab 3)' },
    { name: 'Microcontroller Breadboards & Jumper Wires', cat: 'Robotics & AI', uom: 'Kits', stock: 65, min: 20, price: 350, loc: 'Robotics Workshop Rack C-2' },
    { name: 'Eco-Friendly Whiteboard Markers (Assorted 4-Pack)', cat: 'Stationery', uom: 'Boxes (12 packs)', stock: 85, min: 25, price: 180, loc: 'Staff Lounge Supplies' }
  ];

  for (const c of mockConsumables) {
    await client.query(`
      INSERT INTO public.consumable_inventory (
        campus_id, item_name, category, unit_of_measure,
        current_stock, reorder_threshold, unit_price, storage_location,
        status, created_at
      ) VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662', $1, $2, $3,
        $4, $5, $6, $7, 'IN_STOCK', NOW()
      )
    `, [c.name, c.cat, c.uom, c.stock, c.min, c.price, c.loc]);
  }

  console.log(`✅ Successfully seeded ${mockAssets.length} fixed assets and ${mockConsumables.length} consumable inventory lines in PostgreSQL!`);
  client.release();
  await pool.end();
}

seedInventory().catch(console.error);
