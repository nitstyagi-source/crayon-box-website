const pg = require("pg");
const { Pool } = pg;
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function checkBusesAndInitGatePass() {
  const client = await pool.connect();
  try {
    const buses = await client.query("SELECT bus_number, registration_number, driver_name, status, current_lat, current_lng, current_speed_kmh FROM public.transport_buses;");

    if (buses.rows.length === 0) {
      await client.query(`
        INSERT INTO public.transport_buses (bus_number, registration_number, capacity, driver_name, driver_phone, attendant_name, attendant_phone, route_name, current_lat, current_lng, current_speed_kmh, status, current_location_name)
        VALUES 
          ('BUS-01', 'DL-1PA-8821', 32, 'Ramesh Kumar', '+919876543201', 'Sunita Devi', '+919876543211', 'Route 01 — Burari Main to Sant Nagar', 28.7485, 77.1924, 32, 'Running', 'Sant Nagar Chowk'),
          ('BUS-02', 'DL-1PA-8822', 32, 'Suresh Singh', '+919876543202', 'Geeta Rani', '+919876543212', 'Route 02 — Kamalpur to Milan Vihar', 28.7521, 77.1850, 24, 'Running', 'Kamalpur Road'),
          ('BUS-03', 'DL-1PA-8823', 40, 'Mohan Lal', '+919876543203', 'Kavita Kumari', '+919876543213', 'Route 03 — Nathupura to Shastri Park', 28.7610, 77.1990, 0, 'Idle', 'Campus Parking'),
          ('BUS-04', 'DL-1PA-8824', 32, 'Rajendra Yadav', '+919876543204', 'Pooja Sharma', '+919876543214', 'Route 04 — Jahangirpuri to School', 28.7350, 77.1750, 36, 'Running', 'Jahangirpuri Metro');
      `);
      console.log("✓ Initialized live fleet buses with attendants!");
    }

    // 2. Create gate_passes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gate_passes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pass_type VARCHAR(30) NOT NULL,
        student_id TEXT,
        student_name VARCHAR(150),
        class_name VARCHAR(50),
        guardian_name VARCHAR(150),
        guardian_phone VARCHAR(25) NOT NULL,
        reason TEXT NOT NULL,
        parent_otp VARCHAR(10),
        otp_verified BOOLEAN DEFAULT false,
        host_staff_name VARCHAR(150),
        visitor_photo_url TEXT,
        issued_by_guard VARCHAR(100) DEFAULT 'Main Gate Security',
        status VARCHAR(30) DEFAULT 'APPROVED',
        pass_code VARCHAR(30) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        exited_at TIMESTAMPTZ
      );
    `);

    // Insert sample active passes
    await client.query(`
      INSERT INTO public.gate_passes (pass_type, student_name, class_name, guardian_name, guardian_phone, reason, parent_otp, otp_verified, host_staff_name, status, pass_code)
      VALUES 
        ('STUDENT_EARLY_EXIT', 'Aarav Sharma', 'Class 1-B', 'Sunita Sharma (Mother)', '+919810081008', 'Doctor Appointment (Dental)', '482910', true, 'Ms. Neha Gupta (Class Teacher)', 'APPROVED', 'GP-2026-0891'),
        ('VISITOR', NULL, NULL, 'Dr. Amit Verma', '+919876500112', 'CBSE Inspection & Academic Audit', NULL, true, 'Principal Office', 'APPROVED', 'VP-2026-0104')
      ON CONFLICT (pass_code) DO NOTHING;
    `);

    console.log("✓ All Phase 2 Database Tables verified and seeded successfully!");
  } finally {
    client.release();
    pool.end();
  }
}
checkBusesAndInitGatePass().catch(console.error);
