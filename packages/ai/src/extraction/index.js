/**
 * @file extraction/index.js
 * M3.3: Document/notes extraction – text → structured WO fields (LLM).
 */

const { extractWoFieldsFromText, extractWoFieldsFromOpenAI, sanitizeExtracted } = require('./llm-extract.js');

module.exports = {
  extractWoFieldsFromText,
  extractWoFieldsFromOpenAI,
  sanitizeExtracted,
};
