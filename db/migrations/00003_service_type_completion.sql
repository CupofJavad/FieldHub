-- M2.1: Service-type engine – required completion fields; completion_payload on work_orders

-- Work orders: store completion payload (result, parts_used, unit_condition, return_tracking per design §4.3)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS completion_payload JSONB DEFAULT NULL;

-- Service type config: required fields when transitioning to completed (e.g. completion_payload)
ALTER TABLE service_type_config
  ADD COLUMN IF NOT EXISTS required_completion_fields JSONB DEFAULT '["completion_payload"]';

-- Ensure all existing service types have required_completion_fields set
UPDATE service_type_config
SET required_completion_fields = '["completion_payload"]'
WHERE required_completion_fields IS NULL OR required_completion_fields = 'null';
