/**
 * @file extraction/schema.js
 * Output shape for document/notes extraction – aligns with canonical WO fields (POST /v1/work-orders body).
 * Human reviews before create; extraction suggests only what can be inferred from text.
 */

/**
 * Suggested WO fields that can be extracted from free text. Does not include external_id, provider_key, payer_type, service_type (set by system/provider).
 * @typedef {Object} ExtractedWoFields
 * @property {string} [problem] - Problem description or code
 * @property {{ brand?: string, model?: string, serial?: string }} [product]
 * @property {{ name?: string, address_line1?: string, address_line2?: string, city?: string, state?: string, zip?: string, phone?: string }} [ship_to]
 * @property {string} [instructions] - Special instructions
 * @property {string} [requested_date_start] - ISO date YYYY-MM-DD
 * @property {string} [requested_date_end] - ISO date YYYY-MM-DD
 */

module.exports = {};
