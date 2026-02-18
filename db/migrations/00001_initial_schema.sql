-- TGND initial schema: providers, service_type_config, work_orders
-- M1.3 – lifecycle states and canonical WO model

-- Providers (inbound sources: OEM, extended warranty, customer pay)
CREATE TABLE IF NOT EXISTS providers (
  id         SERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service type configuration (OSR, OSS, installation, depot, etc.)
CREATE TABLE IF NOT EXISTS service_type_config (
  id                SERIAL PRIMARY KEY,
  service_type      TEXT NOT NULL UNIQUE,
  description       TEXT,
  required_statuses JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work orders (canonical model; idempotency via provider_key + external_id)
CREATE TABLE IF NOT EXISTS work_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id          TEXT NOT NULL,
  provider_key         TEXT NOT NULL,
  payer_type           TEXT NOT NULL,
  service_type         TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'received',
  product              JSONB DEFAULT '{}',
  problem              TEXT,
  instructions         TEXT,
  ship_to              JSONB DEFAULT '{}',
  requested_date_start DATE,
  requested_date_end   DATE,
  appointment_date     TIMESTAMPTZ,
  parts                JSONB DEFAULT '[]',
  pricing              JSONB DEFAULT '{}',
  metadata             JSONB DEFAULT '{}',
  idempotency_key      TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_key, external_id)
);

CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders (status);
CREATE INDEX IF NOT EXISTS idx_work_orders_provider_external ON work_orders (provider_key, external_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders (created_at);

-- Seed minimal service types
INSERT INTO service_type_config (service_type, description) VALUES
  ('osr', 'On-Site Repair'),
  ('oss_last_mile', 'OSS / Last Mile delivery + install + swap'),
  ('installation', 'Installation only'),
  ('depot_repair', 'Depot / mail-in repair'),
  ('inspection', 'Inspection / audit')
ON CONFLICT (service_type) DO NOTHING;
