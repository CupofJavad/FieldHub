/**
 * @file index.js
 * TGND structured logger – see docs/ERROR_LOGGING_SYSTEM.md
 * createLogger(service, options) → { error, warn, info, debug }
 * LOG_LEVEL env: ERROR | WARN | INFO | DEBUG (default: INFO)
 */

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function createLogger(service, options = {}) {
  const logLevel = (process.env.LOG_LEVEL || options.logLevel || 'INFO').toUpperCase();
  const minLevel = LEVELS[logLevel] ?? LEVELS.INFO;
  const requestId = options.requestId;
  const jobId = options.jobId;
  const destination = options.destination === 'stderr' ? process.stderr : process.stdout;
  const errDestination = options.errorDestination ?? process.stderr;

  function shouldLog(level) {
    return (LEVELS[level] ?? LEVELS.INFO) >= minLevel;
  }

  function formatEntry(level, message, code, context, stack) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service,
    };
    if (code) entry.code = code;
    if (requestId) entry.requestId = requestId;
    if (jobId) entry.jobId = jobId;
    if (context && typeof context === 'object' && !(context instanceof Error)) {
      entry.context = context;
    }
    if (stack) entry.stack = stack;
    return entry;
  }

  function write(level, payload) {
    const line = JSON.stringify(payload) + '\n';
    if (level === 'ERROR') errDestination.write(line);
    else destination.write(line);
  }

  function log(level, message, code, context) {
    if (!shouldLog(level)) return;
    let stack;
    let ctx = context;
    if (context instanceof Error) {
      stack = context.stack;
      ctx = { message: context.message };
    }
    const payload = formatEntry(level, message, code, ctx, stack);
    write(level, payload);
  }

  return {
    error(msg, code, context) {
      log('ERROR', msg, code, context);
    },
    warn(msg, code, context) {
      log('WARN', msg, code, context);
    },
    info(msg, code, context) {
      log('INFO', msg, code, context);
    },
    debug(msg, code, context) {
      log('DEBUG', msg, code, context);
    },
    child(opts) {
      return createLogger(service, {
        ...options,
        ...opts,
        requestId: opts?.requestId ?? requestId,
        jobId: opts?.jobId ?? jobId,
      });
    },
  };
}

module.exports = { createLogger, LEVELS };
