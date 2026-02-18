/**
 * @file scheduling/index.js
 * M3.2: Scheduling suggestions (suggest appointment windows, ready-to-schedule list).
 */

const { getReadyToSchedule, suggestAppointmentWindows, getSchedulingSuggestions } = require('./suggestions.js');

module.exports = {
  getReadyToSchedule,
  suggestAppointmentWindows,
  getSchedulingSuggestions,
};
