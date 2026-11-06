-- ============================================================================
-- Migration 002: High-Throughput Geolocation Telemetry & Hardware Diagnostics
-- Engine: PostgreSQL 16 + TimescaleDB Extension
-- ============================================================================

-- 1. Unified Location History Hypertable
CREATE TABLE IF NOT EXISTS location_history (
    recorded_at TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL,
    trip_id UUID,
    driver_id UUID,
    source_type VARCHAR(40) DEFAULT 'SMARTPHONE_GPS',
    confidence_score INT DEFAULT 100,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    altitude_m NUMERIC(6,1),
    speed_kmh NUMERIC(5,1) NOT NULL,
    bearing_deg NUMERIC(5,1),
    accuracy_m NUMERIC(5,1) NOT NULL,
    battery_level_pct INT,
    is_charging BOOLEAN,
    is_mock_provider BOOLEAN DEFAULT FALSE,
    milestone_name VARCHAR(255),
    raw_metadata JSONB
);

-- Note: When TimescaleDB is installed, execute:
-- SELECT create_hypertable('location_history', 'recorded_at', chunk_time_interval => INTERVAL '7 days', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_loc_vehicle_time ON location_history(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_loc_trip_time ON location_history(trip_id, recorded_at ASC);
CREATE INDEX IF NOT EXISTS idx_loc_spatial ON location_history USING GIST(coordinates);

-- 2. Hardware Device Diagnostics & Health Hypertable
CREATE TABLE IF NOT EXISTS device_health_records (
    recorded_at TIMESTAMPTZ NOT NULL,
    device_id UUID NOT NULL,
    vehicle_id UUID,
    external_battery_voltage NUMERIC(4,2),
    internal_backup_battery_voltage NUMERIC(3,2),
    is_external_power_connected BOOLEAN DEFAULT TRUE,
    ignition_status BOOLEAN DEFAULT FALSE,
    gsm_signal_strength_csq INT,
    satellite_fix_count INT,
    is_tamper_detected BOOLEAN DEFAULT FALSE,
    tamper_event_type VARCHAR(50)
);

-- Note: When TimescaleDB is installed, execute:
-- SELECT create_hypertable('device_health_records', 'recorded_at', chunk_time_interval => INTERVAL '14 days', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_health_device_time ON device_health_records(device_id, recorded_at DESC);
