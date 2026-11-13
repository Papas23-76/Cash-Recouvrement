const { isOwner } = require('../lib/auth');
const { cmd } = require('../lib/redis');

// Documents autorisés : les textes et paramètres sont publics en lecture,
// les tarifs internes ne sont lisibles et modifiables que par le propriétaire.
const ALLOWED = new Set(['site/params', 'site/texts', 'private/admin']);
const MAX_BYTES = 200000;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const path = String((req.query && req.query.path) || '');
  if (!ALLOWED.has(path)) return res.status(400).json({ error: 'Document inconnu' });

  const owner = isOwner(req);
  if (path === 'private/admin' && !owner) return res.status(403).json({ error: 'Réservé' });

  try {
    if (req.method === 'GET') {
      const raw = await cmd(['GET', 'rp:' + path]);
      return res.status(200).json({ exists: raw !== null, data: raw ? JSON.parse(raw) : null });
    }

    if (req.method === 'POST') {
      if (!owner) return res.status(403).json({ error: 'Réservé au propriétaire' });
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Contenu invalide' });
      }
      const s = JSON.stringify(body);
      if (s.length > MAX_BYTES) return res.status(413).json({ error: 'Contenu trop volumineux' });
      await cmd(['SET', 'rp:' + path, s]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
