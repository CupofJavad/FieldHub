/**
 * @file dispatch/index.js
 * M3.4: Conversational dispatch – parse utterance → intent, entities, suggested_actions.
 */

const {
  parseDispatchUtterance,
  detectIntent,
  extractEntities,
  suggestedActionsFor,
  INTENTS,
} = require('./parse.js');

module.exports = {
  parseDispatchUtterance,
  detectIntent,
  extractEntities,
  suggestedActionsFor,
  INTENTS,
};
