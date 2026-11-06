-- ============================================================================
-- Migration 001: Core Multi-Tenant Identity, Assets & Multi-Mode Tracking
-- Database Engine: PostgreSQL 16 + PostGIS + TimescaleDB
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(15) UNIQUE,
    pan_number VARCHAR(10),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    registered_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    subscription_tier VARCHAR(50) DEFAULT 'STARTER_FREE',
    subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, FLEET_OWNER, BRANCH_MANAGER, DISPATCHER, ACCOUNTANT, DRIVER, CUSTOMER
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_phone UNIQUE (organization_id, phone_number)
);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(organization_id, role);

-- 3. Commercial Vehicles Master
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    registration_plate VARCHAR(20) NOT NULL,
    chassis_number VARCHAR(50),
    engine_number VARCHAR(50),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturing_year INT DEFAULT 2024,
    vehicle_type VARCHAR(50) NOT NULL, -- HCV_28T, TRAILER_40T, LCV_14T, TIPPER, etc.
    gross_vehicle_weight_kg NUMERIC(10,2) DEFAULT 28000.0,
    unladen_weight_kg NUMERIC(10,2) DEFAULT 9500.0,
    payload_capacity_kg NUMERIC(10,2) DEFAULT 18500.0,
    fuel_type VARCHAR(20) DEFAULT 'DIESEL',
    fuel_tank_capacity_litres NUMERIC(6,2) DEFAULT 350.0,
    current_odometer_km NUMERIC(12,2) DEFAULT 0.0,
    operational_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_TRIP, UNDER_MAINTENANCE, IMPOUNDED
    current_driver_id UUID REFERENCES users(id),
    current_location GEOMETRY(Point, 4326),
    current_location_address TEXT,
    last_location_ping_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_plate UNIQUE (organization_id, registration_plate)
);
CREATE INDEX IF NOT EXISTS idx_vehicles_org_status ON vehicles(organization_id, operational_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_spatial ON vehicles USING GIST(current_location);

-- 4. Commercial Drivers Master
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    driving_licence_number VARCHAR(50) NOT NULL,
    licence_classes VARCHAR(100)[] DEFAULT ARRAY['LMV', 'TRANS', 'HGMV']::varchar[],
    licence_expiry_date DATE NOT NULL,
    aadhaar_masked VARCHAR(12),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    duty_status VARCHAR(50) DEFAULT 'OFF_DUTY', -- OFF_DUTY, ON_DUTY_AVAILABLE, ON_DUTY_EN_ROUTE
    base_salary_monthly NUMERIC(10,2) DEFAULT 0.0,
    daily_bata_allowance NUMERIC(8,2) DEFAULT 600.0,
    cash_advance_balance NUMERIC(10,2) DEFAULT 0.0,
    safety_score_rating NUMERIC(3,2) DEFAULT 5.0,
    total_completed_trips INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_org_duty ON drivers(organization_id, duty_status);
CREATE INDEX IF NOT EXISTS idx_drivers_licence_expiry ON drivers(licence_expiry_date);

-- 5. Driver Communication & Hardware Preferences
CREATE TABLE IF NOT EXISTS driver_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID UNIQUE NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    preferred_channel VARCHAR(40) DEFAULT 'SMARTPHONE_APP', -- SMARTPHONE_APP, KEYPAD_FEATURE_PHONE_SMS, KEYPAD_FEATURE_PHONE_IVR, SHARED_CABIN_TABLET
    preferred_language VARCHAR(30) DEFAULT 'ta-IN', -- ta-IN (Tamil), hi-IN (Hindi), te-IN, kn-IN, mr-IN, en-IN
    can_read_sms BOOLEAN DEFAULT TRUE,
    enable_automated_outbound_calls BOOLEAN DEFAULT TRUE,
    speed_dial_sos_configured BOOLEAN DEFAULT FALSE,
    pin_hash_for_shared_kiosk VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Dual-Handshake Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    assignment_status VARCHAR(50) DEFAULT 'PENDING_CONFIRMATION', -- PENDING_CONFIRMATION, ACTIVE, REJECTED, TERMINATED
    rejection_reason TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON assignments(vehicle_id, driver_id) WHERE assignment_status = 'ACTIVE';

-- 7. Tracking Configurations per Vehicle
CREATE TABLE IF NOT EXISTS tracking_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID UNIQUE NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    active_tracking_mode VARCHAR(40) NOT NULL DEFAULT 'SMARTPHONE_GPS', -- SMARTPHONE_GPS, HARDWARE_GPS_STANDARD, HARDWARE_GPS_AIS140, SIM_CELLULAR_LBS, FASTAG_RFID_PLAZA, IVR_KEYPAD_CHECKIN, MANUAL_CHECKPOINT
    fallback_tracking_mode VARCHAR(40) DEFAULT 'FASTAG_RFID_PLAZA',
    telemetry_frequency_seconds INT DEFAULT 10,
    lbs_polling_interval_minutes INT DEFAULT 60,
    ivr_checkin_interval_hours INT DEFAULT 6,
    fastag_wallet_id VARCHAR(100),
    fastag_tag_id VARCHAR(50),
    allow_driver_app_override BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Hardware Tracking Devices (Standard & AIS-140)
CREATE TABLE IF NOT EXISTS tracking_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    imei_number VARCHAR(20) UNIQUE NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    device_type VARCHAR(40) NOT NULL, -- STANDARD_GPS, AIS140_GOVT_CERTIFIED, OBD2_DONGLE
    firmware_version VARCHAR(50),
    primary_sim_iccid VARCHAR(30) NOT NULL,
    primary_sim_phone VARCHAR(20) NOT NULL,
    primary_sim_operator VARCHAR(50) NOT NULL,
    secondary_sim_iccid VARCHAR(30),
    secondary_sim_operator VARCHAR(50),
    protocol_type VARCHAR(30) DEFAULT 'GT06',
    is_active BOOLEAN DEFAULT TRUE,
    installed_vehicle_id UUID REFERENCES vehicles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Device-to-Vehicle Mapping History
CREATE TABLE IF NOT EXISTS device_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES tracking_devices(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    installed_by_technician_name VARCHAR(150),
    installation_odometer_km NUMERIC(12,2),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

-- 10. Tracking Mode Transition History
CREATE TABLE IF NOT EXISTS tracking_mode_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    previous_mode VARCHAR(40) NOT NULL,
    new_mode VARCHAR(40) NOT NULL,
    transitioned_by_user_id UUID NOT NULL REFERENCES users(id),
    transition_reason TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Milestone & Event Tracking (FASTag, IVR, Checkpoints)
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_id UUID,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    event_type VARCHAR(50) NOT NULL,
    event_source VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    coordinates GEOMETRY(Point, 4326),
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Statutory Vehicle Documents Vault
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- RC_BOOK, FITNESS_CERTIFICATE, NATIONAL_PERMIT, INSURANCE_POLICY, PUC, ROAD_TAX
    document_number VARCHAR(100),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    file_storage_url TEXT NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'VALID', -- VALID, EXPIRING_SOON, EXPIRED, UNDER_RENEWAL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vdocs_expiry ON vehicle_documents(expiry_date, verification_status);

-- 13. Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
