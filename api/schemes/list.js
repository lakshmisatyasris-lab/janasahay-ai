import { db } from 'hatchable';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  const q = String(req.query.q || '').trim().slice(0, 120);
  const category = String(req.query.category || '').trim().slice(0, 60);
  const params = [];
  let where = 'TRUE';
  if (category && category !== 'All') { params.push(category); where += ' AND category = $' + params.length; }
  if (q) {
    params.push('%' + q.replace(/[\\%_]/g, '') + '%');
    const n = params.length;
    where += ' AND (name ILIKE $' + n + ' OR summary ILIKE $' + n + ' OR audience ILIKE $' + n + ' OR array_to_string(tags, \' \') ILIKE $' + n + ')';
  }
  const { rows } = await db.query('SELECT id, slug, name, category, audience, summary, benefits, eligibility, documents, apply_url, official_source, level, tags FROM schemes WHERE ' + where + ' ORDER BY name LIMIT 100', params);
  res.json({ schemes: rows, total: rows.length });
}