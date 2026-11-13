const { token, isOwner, passwordOk } = require('../lib/auth');

// GET : dit si le visiteur est connecté en propriétaire.
// POST {password} : ouvre la session (cookie HttpOnly, 7 jours).
// DELETE : ferme la session.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ owner: isOwner(req) });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!passwordOk(body && body.password)) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    res.setHeader(
      'Set-Cookie',
      `rp_admin=${token()}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`
    );
    return res.status(200).json({ owner: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'rp_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');
    return res.status(200).json({ owner: false });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
};
