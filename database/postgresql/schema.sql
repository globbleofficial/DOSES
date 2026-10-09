-- ==============================================================================
-- SECUREWIPE PRO - ENTERPRISE RELATIONAL SCHEMA (POSTGRESQL 15+)
-- High-Performance ACID Compliance with UUIDs, JSONB Telemetry & Audit Immutability
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types for strict data validation
CREATE TYPE wipe_standard AS ENUM ('DOD_5220_22_M', 'GUTMANN_35_PASS', 'NIST_800_88_CLEAR', 'NIST_800_88_PURGE', 'TCG_OPAL_CRYPTO_PURGE');
CREATE TYPE device_bus_type AS ENUM ('NVME', 'SATA', 'SAS', 'USB', 'UFS', 'PCIE');
CREATE TYPE audit_sync_status AS ENUM ('PENDING', 'SYNCED_SALESFORCE', 'FAILED_RETRY');

-- 1. Hardware Assets Table
CREATE TABLE storage_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(128) NOT NULL UNIQUE,
    model_name VARCHAR(255) NOT NULL,
    vendor VARCHAR(128),
    bus_type device_bus_type NOT NULL,
    capacity_bytes BIGINT NOT NULL,
    smart_wear_percentage NUMERIC(5,2),
    salesforce_asset_id VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_storage_assets_serial ON storage_assets(serial_number);
CREATE INDEX idx_storage_assets_sf_id ON storage_assets(salesforce_asset_id);

-- 2. Immutable Sanitization Certificates Table
CREATE TABLE sanitization_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(64) NOT NULL UNIQUE,
    asset_id UUID NOT NULL REFERENCES storage_assets(id) ON DELETE RESTRICT,
    standard_applied wipe_standard NOT NULL,
    passes_completed INTEGER NOT NULL CHECK (passes_completed > 0),
    verification_hash VARCHAR(128) NOT NULL UNIQUE,
    blockchain_tx_hash VARCHAR(128) NOT NULL,
    blockchain_block_number BIGINT,
    blockchain_network VARCHAR(64) DEFAULT 'Polygon POS Mainnet',
    operator_email VARCHAR(255) NOT NULL,
    post_quantum_signature_type VARCHAR(64) DEFAULT 'ML-DSA-87 / Dilithium-5',
    shannon_entropy_score NUMERIC(7,6) CHECK (shannon_entropy_score >= 0.0 AND shannon_entropy_score <= 8.0),
    duration_milliseconds INTEGER NOT NULL,
    certified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_sanitization_cert_id ON sanitization_certificates(certificate_id);
CREATE INDEX idx_sanitization_hash ON sanitization_certificates(verification_hash);

-- 3. High-Resolution Audit Trail
CREATE TABLE wipe_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    certificate_id VARCHAR(64) REFERENCES sanitization_certificates(certificate_id),
    phase_name VARCHAR(64) NOT NULL,
    bytes_processed BIGINT NOT NULL,
    throughput_mbps NUMERIC(10,2),
    hardware_status_flags JSONB,
    log_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wipe_audit_cert ON wipe_audit_logs(certificate_id, log_timestamp);

-- 4. Salesforce Synchronization Event Ledger
CREATE TABLE salesforce_sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(64) REFERENCES sanitization_certificates(certificate_id),
    salesforce_case_id VARCHAR(64),
    sync_status audit_sync_status DEFAULT 'PENDING',
    sync_payload JSONB,
    error_message TEXT,
    attempt_count INTEGER DEFAULT 1,
    synced_at TIMESTAMPTZ
);
