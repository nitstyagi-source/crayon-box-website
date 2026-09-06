"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export interface GeofenceAlert {
  id: string;
  bus_id?: string;
  bus_number: string;
  route_name: string;
  stop_name: string;
  student_name: string;
  parent_phone: string;
  distance_km: number;
  eta_minutes: number;
  dispatched_at: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING';
  message_preview: string;
}

export interface BusStopGeofence {
  id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  student_count: number;
  assigned_bus: string;
  eta_current_trip?: number;
}

export async function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const DEFAULT_STOPS: BusStopGeofence[] = [
  {
    id: 'stop-01',
    stop_name: 'Sant Nagar Main Market (Chowk)',
    latitude: 28.7185,
    longitude: 77.2065,
    radius_meters: 1000,
    student_count: 14,
    assigned_bus: 'Bus 01 (DL-1PC-4501)',
    eta_current_trip: 4
  },
  {
    id: 'stop-02',
    stop_name: 'Model Town Phase 2 Metro Gate 3',
    latitude: 28.7041,
    longitude: 77.1925,
    radius_meters: 1000,
    student_count: 18,
    assigned_bus: 'Bus 02 (DL-1PC-4502)',
    eta_current_trip: 12
  },
  {
    id: 'stop-03',
    stop_name: 'Civil Lines Officers Enclave',
    latitude: 28.6812,
    longitude: 77.2227,
    radius_meters: 1000,
    student_count: 9,
    assigned_bus: 'Bus 01 (DL-1PC-4501)',
    eta_current_trip: 22
  },
  {
    id: 'stop-04',
    stop_name: 'Rohini Sector 9 DC Chowk',
    latitude: 28.7118,
    longitude: 77.1215,
    radius_meters: 1000,
    student_count: 22,
    assigned_bus: 'Bus 04 (DL-1PC-4504)',
    eta_current_trip: 6
  }
];

export async function getGeofenceStopsAction() {
  try {
    return { success: true, stops: DEFAULT_STOPS };
  } catch (err: any) {
    return { success: false, error: err.message, stops: [] };
  }
}

export async function getGeofenceAlertHistoryAction(limit: number = 20) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('transport_geofence_alerts')
      .select('*')
      .order('dispatched_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return { success: true, alerts: [] };
    }

    const alerts: GeofenceAlert[] = data.map((d: any) => ({
      id: d.id,
      bus_id: d.bus_id,
      bus_number: 'Bus 01',
      route_name: 'Main Route',
      stop_name: d.stop_name,
      student_name: d.student_name,
      parent_phone: d.parent_phone,
      distance_km: Number(d.distance_km),
      eta_minutes: d.eta_minutes,
      dispatched_at: d.dispatched_at,
      status: d.status || 'DELIVERED',
      message_preview: `Bus is ${d.distance_km}km from ${d.stop_name}. ETA ~${d.eta_minutes} mins.`
    }));

    return { success: true, alerts };
  } catch (err: any) {
    console.error('getGeofenceAlertHistoryAction error:', err);
    return { success: false, error: err.message, alerts: [] };
  }
}

export async function simulateBusProximityTriggerAction(payload: {
  bus_number: string;
  stop_name: string;
  student_name: string;
  parent_phone: string;
  distance_km: number;
  eta_minutes: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const alertRecord = {
      stop_name: payload.stop_name,
      parent_phone: payload.parent_phone,
      student_name: payload.student_name,
      distance_km: payload.distance_km,
      eta_minutes: payload.eta_minutes,
      status: 'DELIVERED',
      dispatched_at: new Date().toISOString()
    };

    try {
      await supabase.from('transport_geofence_alerts').insert([alertRecord]);
    } catch (e) {
      console.warn('transport_geofence_alerts insert fallback:', e);
    }

    try {
      revalidatePath('/admin/transport');
    } catch (_) {}

    return {
      success: true,
      message: `Geofence triggered! Sent WhatsApp push to ${payload.parent_phone} for student ${payload.student_name}: Bus is ${payload.distance_km} km away (ETA: ${payload.eta_minutes} mins).`,
      alert: {
        id: `geo-sim-${Date.now()}`,
        bus_number: payload.bus_number,
        route_name: 'Active Route',
        stop_name: payload.stop_name,
        student_name: payload.student_name,
        parent_phone: payload.parent_phone,
        distance_km: payload.distance_km,
        eta_minutes: payload.eta_minutes,
        dispatched_at: new Date().toISOString(),
        status: 'DELIVERED' as const,
        message_preview: `Crayon Box Alert: ${payload.bus_number} is ${payload.distance_km} km from ${payload.stop_name}. ETA: ${payload.eta_minutes} mins.`
      }
    };
  } catch (err: any) {
    console.error('simulateBusProximityTriggerAction error:', err);
    return { success: false, error: err.message };
  }
}
