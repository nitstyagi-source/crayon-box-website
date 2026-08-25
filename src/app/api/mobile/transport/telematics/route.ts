import { NextResponse } from 'next/server';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let globalPool: pg.Pool | null = null;
function getPool() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function GET() {
  const pool = getPool();
  try {
    const res = await pool.query(`
      SELECT b.id, b.bus_number, b.driver_name, b.driver_phone, b.route_name,
             COALESCE(b.current_speed_kmh, 34) as "speedKmH",
             COALESCE(b.status, 'In Transit') as status,
             COALESCE(b.current_location_name, 'Sector 62 Crossing, Noida') as "currentLocation",
             COALESCE(b.current_lat, 28.6295) as latitude,
             COALESCE(b.current_lng, 77.3725) as longitude
      FROM public.transport_buses b
      ORDER BY b.updated_at DESC NULLS LAST
      LIMIT 1;
    `);

    const busRow = res.rows[0] || {
      bus_number: 'Bus 04 (Route 12 - Green Park)',
      driver_name: 'Rajesh Kumar',
      driver_phone: '+91 98110 44321',
      speedKmH: 34,
      status: 'In Transit',
      currentLocation: 'Sector 62 Crossing, Noida',
      latitude: 28.6295,
      longitude: 77.3725
    };

    const stopsRes = await pool.query(`
      SELECT stop_name as name, pickup_time as time, 
             false as completed, sequence_number
      FROM public.transport_stops
      ORDER BY sequence_number ASC
      LIMIT 5;
    `);

    const stops = stopsRes.rows.length > 0 ? stopsRes.rows : [
      { name: 'School Campus Main Gate', time: '02:30 PM', completed: true },
      { name: 'Sector 62 Metro Station', time: '02:45 PM', completed: true },
      { name: 'Apex Tower Gate 2 (Your Stop)', time: '03:00 PM', completed: false, isChildStop: true },
      { name: 'Green Park Market', time: '03:15 PM', completed: false },
      { name: 'Indirapuram Hub', time: '03:30 PM', completed: false }
    ];

    const bus = {
      busNumber: busRow.bus_number,
      driverName: busRow.driver_name,
      driverPhone: busRow.driver_phone,
      speedKmH: busRow.speedKmH,
      status: busRow.status,
      currentLocation: busRow.currentLocation,
      nextStop: stops.find((s: any) => !s.completed)?.name || 'Apex Tower Gate 2',
      etaMinutes: 8,
      latitude: Number(busRow.latitude),
      longitude: Number(busRow.longitude),
      stops
    };

    return NextResponse.json({ success: true, data: bus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { busNumber, latitude, longitude, speed, locationName, status = 'In Transit' } = body;

    const lat = Number(latitude) || 28.6295;
    const lng = Number(longitude) || 77.3725;
    const spd = Number(speed) || 30;

    await client.query(`
      UPDATE public.transport_buses
      SET current_lat = $1, current_lng = $2, current_speed_kmh = $3,
          current_location_name = COALESCE($4, current_location_name, 'Sector 62 Crossing, Noida'),
          status = $5, updated_at = NOW()
      WHERE bus_number = $6 OR bus_number ILIKE $6;
    `, [lat, lng, spd, locationName || null, status, busNumber || 'Bus 04']);

    return NextResponse.json({
      success: true,
      message: `✓ Vaani telematics broadcasted (${lat.toFixed(4)}, ${lng.toFixed(4)}) at ${spd} km/h`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
