"use server";

import pg from 'pg';
import { optimizeRouteWith2Opt, BusStopPoint } from '@/lib/algorithms/bus-route-optimizer';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function runBusRouteOptimizationAction(busId?: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const { rows: buses } = await client.query(`
      SELECT * FROM public.transport_buses
      WHERE ($1::uuid IS NULL OR id = $1)
      LIMIT 1
    `, [busId || null]);

    const bus = buses[0];
    if (!bus) {
      return {
        success: false,
        error: 'No active fleet vehicle found to optimize.',
        optimizedStops: [],
        metrics: { totalStops: 0, initialDistanceKm: 0, optimizedDistanceKm: 0, distanceSavedKm: 0, pctImprovement: 0 }
      };
    }

    // Central school campus depot coordinate
    const depotCampus: BusStopPoint = {
      id: 'CAMPUS-DEPOT',
      name: 'Crayon Box Main Campus (Burari)',
      latitude: 28.7456,
      longitude: 77.1982,
      studentCount: 0
    };

    // Query active stops dynamically from database
    const { rows: dbStops } = await client.query(`
      SELECT s.id, s.stop_name as name, s.lat as latitude, s.lng as longitude,
             s.pickup_time,
             COALESCE((
               SELECT count(*)::int 
               FROM public.student_transport_assignments a 
               WHERE a.pickup_stop_id = s.id AND a.is_active = true
             ), 0) as student_count
      FROM public.transport_stops s
      WHERE s.status = 'Active' OR s.status IS NULL
      ORDER BY s.sequence_number ASC
    `);

    let intermediateStops: BusStopPoint[] = [];
    if (dbStops && dbStops.length > 0) {
      intermediateStops = dbStops.map((st: any) => ({
        id: String(st.id),
        name: st.name || 'Stop',
        latitude: Number(st.latitude) || 28.74,
        longitude: Number(st.longitude) || 77.20,
        studentCount: Number(st.student_count) || 0,
        pickupTime: st.pickup_time || '07:30 AM'
      }));
    } else {
      // Fallback only if no stops exist in DB yet
      intermediateStops = [
        { id: 'S1', name: 'Main Campus Station', latitude: 28.7189, longitude: 77.2285, studentCount: 0, pickupTime: '07:15 AM' }
      ];
    }

    const result = optimizeRouteWith2Opt(depotCampus, intermediateStops);

    return {
      success: true,
      busNumber: bus?.bus_number || 'BUS-01',
      routeName: bus?.route_name || 'Main Campus Transit',
      originalDistanceKm: result.originalDistanceKm,
      optimizedDistanceKm: result.optimizedDistanceKm,
      kilometersSaved: result.kilometersSaved,
      estimatedFuelSavingsPct: result.estimatedFuelSavingsPct,
      optimizedStops: result.optimizedStops
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}
