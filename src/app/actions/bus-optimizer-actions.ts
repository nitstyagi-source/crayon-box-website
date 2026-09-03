"use server";

import pg from 'pg';
import { optimizeRouteWith2Opt, BusStopPoint } from '@/lib/algorithms/bus-route-optimizer';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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

    const bus = buses[0] || {
      id: 'BUS-01',
      bus_number: 'DL-1PC-8891 (BUS-01)',
      route_name: 'Sant Nagar - Burari - Wazirabad Corridor'
    };

    // Central school campus depot coordinate
    const depotCampus: BusStopPoint = {
      id: 'CAMPUS-DEPOT',
      name: 'Crayon Box Main Campus (Burari)',
      latitude: 28.7456,
      longitude: 77.1982,
      studentCount: 0
    };

    // Sample active stops along the corridor
    const intermediateStops: BusStopPoint[] = [
      { id: 'S1', name: 'Wazirabad Village Stand', latitude: 28.7189, longitude: 77.2285, studentCount: 8, pickupTime: '07:15 AM' },
      { id: 'S2', name: 'Sant Nagar Main Chowk', latitude: 28.7482, longitude: 77.1995, studentCount: 12, pickupTime: '07:30 AM' },
      { id: 'S3', name: 'Jharoda Dairy Gate', latitude: 28.7610, longitude: 77.2050, studentCount: 6, pickupTime: '07:42 AM' },
      { id: 'S4', name: 'Milan Vihar Crossing', latitude: 28.7390, longitude: 77.2020, studentCount: 9, pickupTime: '07:22 AM' },
      { id: 'S5', name: 'Baba Colony Stop', latitude: 28.7430, longitude: 77.1960, studentCount: 5, pickupTime: '07:36 AM' }
    ];

    const result = optimizeRouteWith2Opt(depotCampus, intermediateStops);

    return {
      success: true,
      busNumber: bus.bus_number,
      routeName: bus.route_name,
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
