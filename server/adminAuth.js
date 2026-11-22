const crypto = require('crypto');

/**
 * Protege rotas de administrador com `Authorization: Bearer <ADMIN_TOKEN>`.
 * Fail closed: sem ADMIN_TOKEN configurado, nenhuma rota de admin é liberada.
 */
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'Admin routes are disabled: ADMIN_TOKEN is not set' });
  }
  const match = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  const given = Buffer.from(match ? match[1] : '');
  const wanted = Buffer.from(expected);
  // timingSafeEqual exige o mesmo tamanho; checar antes não vaza o conteúdo, só o tamanho.
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

module.exports = { requireAdmin };
