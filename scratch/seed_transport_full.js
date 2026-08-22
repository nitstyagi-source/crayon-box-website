const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initTransportFull() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS transport_buses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      bus_number VARCHAR(50) NOT NULL,
      registration_number VARCHAR(50) UNIQUE NOT NULL,
      bus_type VARCHAR(100) DEFAULT 'AC 32-Seater (Tata Starbus)',
      capacity INTEGER DEFAULT 32,
      branch VARCHAR(100) DEFAULT 'Main Campus',
      driver_name VARCHAR(150) NOT NULL,
      driver_phone VARCHAR(50) NOT NULL,
      driver_license_no VARCHAR(100),
      attendant_name VARCHAR(150) NOT NULL,
      attendant_phone VARCHAR(50) NOT NULL,
      route_name VARCHAR(150),
      gps_device_id VARCHAR(100) DEFAULT 'GPS-TK103-8921',
      insurance_expiry DATE,
      fitness_expiry DATE,
      permit_expiry DATE,
      puc_expiry DATE,
      odometer_km INTEGER DEFAULT 45200,
      current_lat NUMERIC(10,6) DEFAULT 28.7185,
      current_lng NUMERIC(10,6) DEFAULT 77.1995,
      current_speed_kmh INTEGER DEFAULT 32,
      current_location_name VARCHAR(200) DEFAULT 'Near Sant Nagar Chowk',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transport_routes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      route_code VARCHAR(50) UNIQUE NOT NULL,
      route_name VARCHAR(150) NOT NULL,
      bus_id UUID REFERENCES transport_buses(id) ON DELETE SET NULL,
      starting_point VARCHAR(150) DEFAULT 'School Main Campus',
      destination VARCHAR(150) DEFAULT 'Nathupura via Sant Nagar',
      total_stops INTEGER DEFAULT 6,
      shift VARCHAR(50) DEFAULT 'Both',
      morning_start_time VARCHAR(20) DEFAULT '07:00 AM',
      afternoon_start_time VARCHAR(20) DEFAULT '01:45 PM',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transport_stops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
      stop_name VARCHAR(150) NOT NULL,
      address TEXT,
      pickup_time VARCHAR(20) NOT NULL,
      drop_time VARCHAR(20) NOT NULL,
      sequence_number INTEGER DEFAULT 1,
      monthly_fee NUMERIC(10,2) DEFAULT 2200.00,
      lat NUMERIC(10,6),
      lng NUMERIC(10,6),
      status VARCHAR(50) DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS student_transport_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      student_name VARCHAR(150) NOT NULL,
      admission_no VARCHAR(50) NOT NULL,
      class_name VARCHAR(100) NOT NULL,
      section_name VARCHAR(50) NOT NULL,
      route_id UUID REFERENCES transport_routes(id) ON DELETE SET NULL,
      route_name VARCHAR(150) NOT NULL,
      pickup_stop_id UUID REFERENCES transport_stops(id) ON DELETE SET NULL,
      pickup_stop_name VARCHAR(150) NOT NULL,
      drop_stop_name VARCHAR(150) NOT NULL,
      bus_number VARCHAR(50) NOT NULL,
      registration_number VARCHAR(50) NOT NULL,
      monthly_transport_fee NUMERIC(10,2) DEFAULT 2200.00,
      is_active BOOLEAN DEFAULT true,
      emergency_contact VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transport_journey_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      log_date DATE NOT NULL,
      shift VARCHAR(50) NOT NULL,
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      student_name VARCHAR(150) NOT NULL,
      route_name VARCHAR(150) NOT NULL,
      bus_number VARCHAR(50) NOT NULL,
      stop_name VARCHAR(150) NOT NULL,
      boarded_at TIMESTAMPTZ,
      school_reached_at TIMESTAMPTZ,
      dropped_at TIMESTAMPTZ,
      escort_verified BOOLEAN DEFAULT false,
      escort_name VARCHAR(150),
      escort_relation VARCHAR(50),
      handover_by_attendant VARCHAR(150),
      status VARCHAR(50) DEFAULT 'Boarded',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transport_maintenance_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bus_id UUID REFERENCES transport_buses(id) ON DELETE CASCADE,
      service_date DATE NOT NULL,
      odometer_reading INTEGER NOT NULL,
      service_type VARCHAR(100) NOT NULL,
      cost NUMERIC(10,2) NOT NULL,
      workshop_name VARCHAR(150) NOT NULL,
      next_service_due_date DATE,
      status VARCHAR(50) DEFAULT 'Completed'
    );

    CREATE TABLE IF NOT EXISTS transport_fuel_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bus_id UUID REFERENCES transport_buses(id) ON DELETE CASCADE,
      fuel_date DATE NOT NULL,
      fuel_type VARCHAR(50) DEFAULT 'CNG',
      quantity_kg_or_ltr NUMERIC(6,2) NOT NULL,
      total_cost NUMERIC(10,2) NOT NULL,
      odometer_reading INTEGER NOT NULL,
      driver_name VARCHAR(150) NOT NULL,
      bill_no VARCHAR(100)
    );
  `);

  console.log('✅ Created transport tables successfully!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Seed Sample Buses
  const buses = [
    {
      num: 'Bus 01',
      reg: 'DL-1VA-8921',
      type: 'AC 32-Seater (Tata Starbus)',
      cap: 32,
      driver: 'Amit Singh',
      driverPhone: '+919876543210',
      license: 'DL-04201800921',
      attendant: 'Sunita Devi',
      attendantPhone: '+919811002233',
      route: 'R-05 — Burari & Sant Nagar',
      gps: 'GPS-TK103-8921',
      insExp: '2027-03-15',
      fitExp: '2026-11-20',
      permExp: '2027-05-10',
      pucExp: '2026-10-30',
      odo: 48200,
      lat: 28.7214,
      lng: 77.2012,
      speed: 34,
      locName: 'Sant Nagar Main Market',
      status: 'Running'
    },
    {
      num: 'Bus 02',
      reg: 'DL-1VA-8922',
      type: 'AC 32-Seater (Force Traveller)',
      cap: 26,
      driver: 'Vikram Patel',
      driverPhone: '+919123456789',
      license: 'DL-04201600812',
      attendant: 'Kanta Bai',
      attendantPhone: '+919911223344',
      route: 'R-02 — Rohini Sector 11-16',
      gps: 'GPS-TK103-8922',
      insExp: '2027-01-10',
      fitExp: '2026-09-15', // Expires soon
      permExp: '2027-04-12',
      pucExp: '2026-12-05',
      odo: 52100,
      lat: 28.7350,
      lng: 77.1120,
      speed: 28,
      locName: 'Rohini West Metro Station',
      status: 'Running'
    },
    {
      num: 'Bus 03',
      reg: 'DL-1VA-8923',
      type: 'AC 40-Seater (Eicher Skyline)',
      cap: 40,
      driver: 'Rajesh Kumar',
      driverPhone: '+919988776655',
      license: 'DL-04201500345',
      attendant: 'Geeta Sharma',
      attendantPhone: '+919877665544',
      route: 'R-07 — Model Town & GTB Nagar',
      gps: 'GPS-TK103-8923',
      insExp: '2027-06-20',
      fitExp: '2027-02-18',
      permExp: '2027-08-15',
      pucExp: '2026-11-12',
      odo: 39400,
      lat: 28.7010,
      lng: 77.1950,
      speed: 0,
      locName: 'School Campus Parking Lot',
      status: 'Active'
    },
    {
      num: 'Bus 04',
      reg: 'DL-1VA-8924',
      type: 'AC 26-Seater (Force Traveller)',
      cap: 26,
      driver: 'Jaswant Singh',
      driverPhone: '+919810556677',
      license: 'DL-04201700456',
      attendant: 'Meena Kumari',
      attendantPhone: '+919811443322',
      route: 'R-09 — Timarpur & Civil Lines',
      gps: 'GPS-TK103-8924',
      insExp: '2027-04-30',
      fitExp: '2026-08-30', // In maintenance
      permExp: '2027-03-22',
      pucExp: '2026-09-18',
      odo: 61000,
      lat: 28.6820,
      lng: 77.2210,
      speed: 0,
      locName: 'Authorized Tata Workshop - GT Karnal Rd',
      status: 'Maintenance'
    }
  ];

  const busMap = {};
  for (const b of buses) {
    const res = await client.query(`
      INSERT INTO transport_buses (
        campus_id, bus_number, registration_number, bus_type, capacity,
        driver_name, driver_phone, driver_license_no, attendant_name,
        attendant_phone, route_name, gps_device_id, insurance_expiry,
        fitness_expiry, permit_expiry, puc_expiry, odometer_km,
        current_lat, current_lng, current_speed_kmh, current_location_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (registration_number) DO UPDATE SET status = EXCLUDED.status, current_location_name = EXCLUDED.current_location_name
      RETURNING id, bus_number;
    `, [
      campusId, b.num, b.reg, b.type, b.cap, b.driver, b.driverPhone,
      b.license, b.attendant, b.attendantPhone, b.route, b.gps,
      b.insExp, b.fitExp, b.permExp, b.pucExp, b.odo, b.lat, b.lng,
      b.speed, b.locName, b.status
    ]);
    busMap[b.num] = res.rows[0].id;
  }

  // 2. Seed Sample Route R-05 & Stops
  const r05Res = await client.query(`
    INSERT INTO transport_routes (
      campus_id, route_code, route_name, bus_id, starting_point,
      destination, total_stops, shift, morning_start_time, afternoon_start_time, status
    ) VALUES (
      $1, 'R-05', 'Route R-05 — Burari & Sant Nagar', $2,
      'School Campus', 'Nathupura via Sant Nagar & Burari Chowk', 4, 'Both', '07:00 AM', '01:45 PM', 'Active'
    )
    ON CONFLICT (route_code) DO UPDATE SET route_name = EXCLUDED.route_name
    RETURNING id;
  `, [campusId, busMap['Bus 01']]);

  const route05Id = r05Res.rows[0].id;

  const stops = [
    { name: 'Burari Chowk (Pillar 42)', addr: 'Near Burari Police Station', pick: '07:20 AM', drop: '02:05 PM', seq: 1, fee: 2200.00, lat: 28.7250, lng: 77.2050 },
    { name: 'Sant Nagar Main Market', addr: 'Opposite PNB Bank, Main Road', pick: '07:30 AM', drop: '01:55 PM', seq: 2, fee: 2200.00, lat: 28.7214, lng: 77.2012 },
    { name: 'Nathupura Bus Stand', addr: 'Nathupura Road, Block B', pick: '07:40 AM', drop: '01:45 PM', seq: 3, fee: 2400.00, lat: 28.7300, lng: 77.1950 },
    { name: 'School Campus Main Gate', addr: '6/20, Shastri Park Ext, Burari', pick: '07:55 AM', drop: '01:30 PM', seq: 4, fee: 0.00, lat: 28.7185, lng: 77.1995 }
  ];

  for (const s of stops) {
    await client.query(`
      INSERT INTO transport_stops (
        route_id, stop_name, address, pickup_time, drop_time, sequence_number, monthly_fee, lat, lng, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active')
    `, [route05Id, s.name, s.addr, s.pick, s.drop, s.seq, s.fee, s.lat, s.lng]);
  }

  // 3. Seed Student Transport Assignment for Aarav Sharma & Ananya Gupta
  const stuRes = await client.query(`SELECT id, first_name, last_name, admission_no FROM students LIMIT 5;`);
  if (stuRes.rows.length > 0) {
    const s1 = stuRes.rows[0];
    await client.query(`
      INSERT INTO student_transport_assignments (
        campus_id, student_id, student_name, admission_no, class_name, section_name,
        route_id, route_name, pickup_stop_name, drop_stop_name, bus_number, registration_number,
        monthly_transport_fee, is_active, emergency_contact
      ) VALUES (
        $1, $2, $3, $4, 'Grade 5', 'A', $5, 'Route R-05 — Burari & Sant Nagar',
        'Burari Chowk (Pillar 42)', 'Burari Chowk (Pillar 42)', 'Bus 01', 'DL-1VA-8921',
        2200.00, true, '+919871122334'
      )
    `, [campusId, s1.id, s1.first_name + ' ' + (s1.last_name || ''), s1.admission_no || 'CBS-2026-0129', route05Id]);

    // 4. Seed Today's Journey Log for Aarav Sharma
    const todayStr = new Date().toISOString().split('T')[0];
    await client.query(`
      INSERT INTO transport_journey_logs (
        campus_id, log_date, shift, student_id, student_name, route_name, bus_number,
        stop_name, boarded_at, school_reached_at, dropped_at, escort_verified,
        escort_name, escort_relation, handover_by_attendant, status
      ) VALUES (
        $1, $2, 'Morning Pickup', $3, $4, 'Route R-05 — Burari & Sant Nagar', 'Bus 01',
        'Burari Chowk (Pillar 42)', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 20 minutes',
        NULL, true, 'Sunita Sharma', 'Mother', 'Sunita Devi (Attendant)', 'Reached School'
      )
    `, [campusId, todayStr, s1.id, s1.first_name + ' ' + (s1.last_name || '')]);
  }

  // 5. Seed Maintenance & Fuel Logs
  const todayStr = new Date().toISOString().split('T')[0];
  await client.query(`
    INSERT INTO transport_maintenance_logs (
      bus_id, service_date, odometer_reading, service_type, cost, workshop_name, next_service_due_date, status
    ) VALUES (
      $1, $2, 48000, 'Routine Engine Oil, Air Filter & Brake Shoe Inspection', 8500.00, 'Authorized Tata Motors Commercial Center', '2026-11-20', 'Completed'
    )
  `, [busMap['Bus 01'], todayStr]);

  await client.query(`
    INSERT INTO transport_fuel_logs (
      bus_id, fuel_date, fuel_type, quantity_kg_or_ltr, total_cost, odometer_reading, driver_name, bill_no
    ) VALUES (
      $1, $2, 'CNG', 32.50, 2600.00, 48150, 'Amit Singh', 'IGL-CNG-88291'
    )
  `, [busMap['Bus 01'], todayStr]);

  console.log('✅ Seeded full transport ecosystem successfully!');
  await client.end();
}

initTransportFull().catch(console.error);
