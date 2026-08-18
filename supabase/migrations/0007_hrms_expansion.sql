-- Phase 9: HRMS Expansion (Geofencing, TOTP, and Payroll Upgrades)

-- Modify staff_attendance to support advanced Geofencing and Anomalies
ALTER TABLE staff_attendance
ADD COLUMN gps_coordinates JSONB, -- stores { lat: string, lng: string, accuracy: number }
ADD COLUMN geofence_status VARCHAR(50), -- 'In Zone', 'Out of Zone'
ADD COLUMN anomaly_flag BOOLEAN DEFAULT false, -- True if GPS accuracy is low or mocked
ADD COLUMN totp_hash VARCHAR(255); -- The dynamic QR hash scanned during check-in

-- Modify payroll_ledgers to support unified Banking CSVs and Payslips
ALTER TABLE payroll_ledgers
ADD COLUMN payslip_url TEXT, -- URL to the generated PDF payslip
ADD COLUMN bank_csv_generated BOOLEAN DEFAULT false; -- True if locked and sent to finance

-- Create a mock function to flag anomalies based on accuracy
CREATE OR REPLACE FUNCTION flag_attendance_anomaly()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.gps_coordinates->>'accuracy')::NUMERIC > 50 THEN
        NEW.anomaly_flag := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_attendance_anomaly
BEFORE INSERT OR UPDATE ON staff_attendance
FOR EACH ROW EXECUTE FUNCTION flag_attendance_anomaly();
