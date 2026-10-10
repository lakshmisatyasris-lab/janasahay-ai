import { db, auth } from 'hatchable';

export const access = 'public';
export const methods = ['GET', 'POST', 'DELETE'];

export default async function (req, res) {
  const user = await auth.getUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to save schemes to your personal list.' });
  const userId = String(user.id);
  if (req.method === 'POST') {
    const schemeId = Number(req.body && req.body.scheme_id);
    if (!Number.isSafeInteger(schemeId) || schemeId < 1) return res.status(400).json({ error: 'A valid scheme is required.' });
    const { rows: found } = await db.query('SELECT id FROM schemes WHERE id = $1', [schemeId]);
    if (!found.length) return res.status(404).json({ error: 'Scheme not found.' });
    await db.query('INSERT INTO user_saved_schemes (user_id, scheme_id) VALUES ($1, $2) ON CONFLICT (user_id, scheme_id) DO NOTHING', [userId, schemeId]);
    return res.json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const schemeId = Number(req.body && req.body.scheme_id);
    if (!Number.isSafeInteger(schemeId) || schemeId < 1) return res.status(400).json({ error: 'A valid scheme is required.' });
    await db.query('DELETE FROM user_saved_schemes WHERE user_id = $1 AND scheme_id = $2', [userId, schemeId]);
    return res.json({ ok: true });
  }
  const { rows } = await db.query('SELECT s.id, s.slug, s.name, s.category, s.summary, s.apply_url, s.official_source, ss.notes, ss.created_at AS saved_at FROM user_saved_schemes ss JOIN schemes s ON s.id = ss.scheme_id WHERE ss.user_id = $1 ORDER BY ss.created_at DESC', [userId]);
  res.json({ saved: rows });
}