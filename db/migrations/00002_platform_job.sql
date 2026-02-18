-- M1.5: Store field platform job id and type on work_orders (for assign flow)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS platform_job_id TEXT,
  ADD COLUMN IF NOT EXISTS platform_type TEXT;
