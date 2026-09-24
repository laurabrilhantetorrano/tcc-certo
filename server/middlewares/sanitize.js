/**
 * Sanitiza objetos recursivamente para evitar NoSQL Injection
 * Remove chaves que comecem com '$' ou que contenham '.' nos corpos e queries de requisições.
 */
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Bloqueia operadores de injeção MongoDB ($gt, $ne, $where, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = typeof value === 'object' && value !== null ? cleanObject(value) : value;
  }
  return cleaned;
}

export function sanitizeNoSql(req, res, next) {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
}

export default sanitizeNoSql;
