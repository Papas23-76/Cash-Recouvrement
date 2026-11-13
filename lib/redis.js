// Client minimal pour Upstash Redis (API REST). Accepte les noms de variables
// ajoutés par l'intégration Upstash et ceux de l'ancien Vercel KV.
function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Stockage non configuré (variables Upstash absentes)');
  return { url, token };
}

async function cmd(args) {
  const { url, token } = config();
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'HTTP ' + r.status);
  return j.result;
}

module.exports = { cmd };
