/**
 * @file extraction/llm-extract.js
 * M3.3: Extract structured WO fields from free-text notes using an LLM (OpenAI/Anthropic).
 * Keys in env (OPENAI_API_KEY or ANTHROPIC_API_KEY); no keys in code.
 */

const EXTRACTION_SYSTEM = `You are a data extraction assistant. From the user's notes or document text, extract work order fields and return ONLY a single JSON object with no other text. Use exactly these keys; omit any key not found. Use null for missing values.
Keys:
- problem (string): issue or problem description
- product (object): brand, model, serial (strings)
- ship_to (object): name, address_line1, address_line2, city, state, zip, phone (strings)
- instructions (string): special instructions
- requested_date_start (string): ISO date YYYY-MM-DD if a date is mentioned
- requested_date_end (string): ISO date YYYY-MM-DD if an end date is mentioned

Return only valid JSON.`;

/**
 * Call OpenAI Chat Completions (env OPENAI_API_KEY). Model: options.model or env OPENAI_MODEL or "gpt-4o-mini".
 * @param {string} text - Raw notes or document text
 * @param {{ apiKey?: string, model?: string, baseUrl?: string }} [options]
 * @returns {Promise<{ suggested_wo_fields: Object|null, error?: string }>}
 */
async function extractWoFieldsFromOpenAI(text, options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const baseUrl = options.baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

  if (!apiKey) {
    return { suggested_wo_fields: null, error: 'OPENAI_API_KEY not set; add to .env for LLM extraction' };
  }

  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return { suggested_wo_fields: {}, error: null };
  }

  try {
    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: EXTRACTION_SYSTEM },
          { role: 'user', content: `Extract work order fields from:\n\n${trimmed}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        suggested_wo_fields: null,
        error: `OpenAI API error ${res.status}: ${errBody.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { suggested_wo_fields: null, error: 'Empty response from LLM' };
    }

    const parsed = JSON.parse(content);
    const suggested_wo_fields = sanitizeExtracted(parsed);
    return { suggested_wo_fields, error: null };
  } catch (err) {
    return {
      suggested_wo_fields: null,
      error: err.message || 'LLM extraction failed',
    };
  }
}

/** Keep only known keys and string/object shapes for WO. */
function sanitizeExtracted(parsed) {
  if (parsed == null || typeof parsed !== 'object') return {};
  const out = {};
  if (typeof parsed.problem === 'string') out.problem = parsed.problem;
  if (parsed.product != null && typeof parsed.product === 'object') {
    out.product = {};
    if (typeof parsed.product.brand === 'string') out.product.brand = parsed.product.brand;
    if (typeof parsed.product.model === 'string') out.product.model = parsed.product.model;
    if (typeof parsed.product.serial === 'string') out.product.serial = parsed.product.serial;
  }
  if (parsed.ship_to != null && typeof parsed.ship_to === 'object') {
    out.ship_to = {};
    const st = parsed.ship_to;
    ['name', 'address_line1', 'address_line2', 'city', 'state', 'zip', 'phone'].forEach((k) => {
      if (typeof st[k] === 'string') out.ship_to[k] = st[k];
    });
  }
  if (typeof parsed.instructions === 'string') out.instructions = parsed.instructions;
  if (typeof parsed.requested_date_start === 'string') out.requested_date_start = parsed.requested_date_start;
  if (typeof parsed.requested_date_end === 'string') out.requested_date_end = parsed.requested_date_end;
  return out;
}

/**
 * Extract WO fields from text. Uses OpenAI if OPENAI_API_KEY set; otherwise returns error (no key in code).
 * @param {string} text - Notes or document body
 * @param {{ apiKey?: string, model?: string, baseUrl?: string }} [options]
 * @returns {Promise<{ suggested_wo_fields: Object|null, error?: string }>}
 */
async function extractWoFieldsFromText(text, options = {}) {
  return extractWoFieldsFromOpenAI(text, options);
}

module.exports = {
  extractWoFieldsFromText,
  extractWoFieldsFromOpenAI,
  sanitizeExtracted,
};
