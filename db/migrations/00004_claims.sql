-- M4.3: Claims table for billing/claims automation (submit to providers, track status)
CREATE TABLE IF NOT EXISTS claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id     UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  claim_type        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft',
  proposed_claim    JSONB,
  deductions        JSONB DEFAULT '[]',
  submitted_at      TIMESTAMPTZ,
  provider_response JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_order_id)
);

CREATE INDEX IF NOT EXISTS idx_claims_work_order_id ON claims (work_order_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);

COMMENT ON COLUMN claims.claim_type IS 'repair | diag | denied';
COMMENT ON COLUMN claims.status IS 'draft | submitted | approved | denied | partial';
