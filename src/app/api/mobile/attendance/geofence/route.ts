import { NextRequest, NextResponse } from "next/server";

// School Campus Coordinates (Main Campus - Sector 62)
const CAMPUS_LAT = 28.6295;
const CAMPUS_LNG = 77.3725;
const MAX_RADIUS_METERS = 250; // 250m perimeter

// Haversine formula to compute great-circle distance in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, latitude, longitude, accuracy, employeeCode } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing GPS coordinates." },
        { status: 400 }
      );
    }

    const distance = getDistanceFromLatLonInMeters(latitude, longitude, CAMPUS_LAT, CAMPUS_LNG);
    const isInsideGeofence = distance <= MAX_RADIUS_METERS;

    if (!isInsideGeofence) {
      return NextResponse.json({
        success: false,
        error: `Out of Campus Perimeter. You are ${Math.round(distance)}m away from the campus gate (Max allowed: ${MAX_RADIUS_METERS}m).`,
        distanceMeters: Math.round(distance),
        isInsideGeofence: false
      }, { status: 403 });
    }

    const clockInRecord = {
      userId,
      employeeCode: employeeCode || "EMP-2026-042",
      clockInTime: new Date().toISOString(),
      distanceMeters: Math.round(distance),
      accuracyMeters: accuracy || 10,
      status: "Present - Geofenced ✓"
    };

    return NextResponse.json({
      success: true,
      message: `Geofence verified! Clock-in logged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${Math.round(distance)}m from gate).`,
      data: clockInRecord
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
