import { NextResponse } from 'next/server';
import pg from 'pg';

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
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
             COALESCE(b.current_speed_kmh, 0) as "speedKmH",
             COALESCE(b.status, 'Parked') as status,
             COALESCE(b.current_location_name, 'Campus Depot') as "currentLocation",
             COALESCE(b.current_lat, 28.6295) as latitude,
             COALESCE(b.current_lng, 77.3725) as longitude
      FROM public.transport_buses b
      ORDER BY b.updated_at DESC NULLS LAST
      LIMIT 1;
    `);

    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const busRow = res.rows[0];

    const stopsRes = await pool.query(`
      SELECT stop_name as name, pickup_time as time, 
             false as completed, sequence_number
      FROM public.transport_stops
      ORDER BY sequence_number ASC
      LIMIT 10;
    `);

    const stops = stopsRes.rows;

    const bus = {
      busNumber: busRow.bus_number,
      driverName: busRow.driver_name || 'Driver Not Assigned',
      driverPhone: busRow.driver_phone || '',
      speedKmH: Number(busRow.speedKmH) || 0,
      status: busRow.status,
      currentLocation: busRow.currentLocation,
      nextStop: stops.find((s: any) => !s.completed)?.name || (stops[0]?.name || 'N/A'),
      etaMinutes: stops.length > 0 ? 10 : 0,
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
