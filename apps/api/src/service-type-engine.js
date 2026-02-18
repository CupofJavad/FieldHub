/**
 * M2.1 – Service-type engine: completion validation per service_type_config.
 * When a WO is moved to "completed", required_completion_fields must be present.
 */

/**
 * Validates that a work order satisfies the completion requirements for its service type.
 * @param {Object} wo - Work order (current + any pending patch applied)
 * @param {Object} config - { required_completion_fields: string[] }
 * @returns {{ valid: boolean, message?: string }}
 */
function validateCompletion(wo, config) {
  if (!config || !Array.isArray(config.required_completion_fields)) {
    return { valid: true };
  }
  for (const field of config.required_completion_fields) {
    const value = wo[field];
    if (value === undefined || value === null) {
      return { valid: false, message: `Missing required completion field: ${field}` };
    }
    if (field === 'completion_payload') {
      if (typeof value !== 'object' || Array.isArray(value)) {
        return { valid: false, message: 'completion_payload must be an object' };
      }
      if (Object.keys(value).length === 0) {
        return { valid: false, message: 'completion_payload must contain at least one of: result, parts_used, unit_condition, return_tracking' };
      }
    }
  }
  return { valid: true };
}

module.exports = { validateCompletion };
