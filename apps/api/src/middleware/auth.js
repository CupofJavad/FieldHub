/**
 * M4.4 – Optional API key auth. If API_KEY (or TGND_API_KEY) is set in env, require it on all routes except /health.
 * Client sends X-API-Key: <key> or Authorization: Bearer <key>.
 */
function requireApiKey(req, res, next) {
  const key = process.env.TGND_API_KEY || process.env.API_KEY;
  if (!key) return next();

  const provided = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));
  if (provided !== key) {
    return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_API_KEY' });
  }
  next();
}

module.exports = { requireApiKey };
