-- Phase 4: Logistics, Safety & Security Schema

-- ==========================================
-- TRANSPORT SCHEMA
-- ==========================================

-- 1. Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Bus',
    status VARCHAR(50) DEFAULT 'Active', -- Active, Maintenance, Out of Service
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL, -- e.g. Route 4 (South Sector)
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    zone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Stops
CREATE TABLE stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    sequence_order INT NOT NULL,
    estimated_arrival TIME,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Route Assignments (Mapping Students to Stops)
CREATE TABLE route_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
    -- Assuming a students table would exist; using admissions_applications for now as proxy
    student_id UUID REFERENCES admissions_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trip Logs
CREATE TABLE trip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'In Progress', -- In Progress, Completed, Delayed, Emergency
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    current_speed INT,
    last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VISITOR SCHEMA
-- ==========================================

-- 1. Visitors
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Visitor Logs
CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    visitor_type VARCHAR(50) NOT NULL, -- Parent, Vendor, Official
    purpose TEXT,
    host_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Awaiting Approval', -- Awaiting Approval, Approved, Checked In, Checked Out
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Superadmins can do everything
CREATE POLICY "Superadmins can manage vehicles" ON vehicles FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage routes" ON routes FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage stops" ON stops FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage route assignments" ON route_assignments FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage trip logs" ON trip_logs FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage visitors" ON visitors FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage visitor logs" ON visitor_logs FOR ALL USING (is_superadmin());

-- Kiosks (public or anonymous) can insert visitors and logs
CREATE POLICY "Anyone can insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert visitor logs" ON visitor_logs FOR INSERT WITH CHECK (true);

-- Parents can view their own route assignments
CREATE POLICY "Parents can view route assignments" ON route_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM admissions_applications WHERE id = student_id AND parent_id = auth.uid())
);
