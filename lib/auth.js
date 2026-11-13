const crypto = require('crypto');

// Jeton de session dérivé du mot de passe admin : rien n'est stocké côté serveur,
// et le mot de passe lui-même n'apparaît jamais dans le cookie.
function token() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHmac('sha256', pw).update('rp-admin-v1').digest('hex');
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function isOwner(req) {
  const t = token();
  if (!t) return false;
  return safeEqual(parseCookies(req.headers && req.headers.cookie).rp_admin || '', t);
}

function passwordOk(pw) {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || typeof pw !== 'string') return false;
  return safeEqual(pw, p);
}

module.exports = { token, isOwner, passwordOk };
