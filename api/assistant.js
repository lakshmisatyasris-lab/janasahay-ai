import { ai, db } from 'hatchable';

export const access = 'public';
export const methods = ['POST'];

export default async function (req, res) {
  const body = req.body || {};
  const question = String(body.message || '').trim();
  const language = String(body.language || 'English').slice(0, 40);
  const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
  if (!question || question.length > 3000) return res.status(400).json({ error: 'Please enter a question of up to 3,000 characters.' });
  const { rows } = await db.query('SELECT name, category, audience, summary, benefits, eligibility, documents, apply_url, official_source, tags FROM schemes ORDER BY name LIMIT 100');
  const catalog = rows.map(s => ({ name:s.name, category:s.category, audience:s.audience, summary:s.summary, benefits:s.benefits, eligibility:s.eligibility, documents:s.documents, official_url:s.apply_url, source:s.official_source }));
  const terms = question.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
  const ranked = rows.map(s => {
    const haystack = [s.name,s.category,s.audience,s.summary,(s.tags||[]).join(' ')].join(' ').toLowerCase();
    return { scheme:s, score:terms.reduce((n,t)=>n+(haystack.includes(t)?1:0),0) };
  }).sort((a,b)=>b.score-a.score).filter(x=>x.score>0).slice(0,3).map(x=>x.scheme);
  try {
    const result = await ai.generateText({
      model: 'gemini',
      purpose: 'jansahay-citizen-guidance',
      maxTokens: 1200,
      system: 'You are JanSahay AI, a careful multilingual Indian government-services information assistant. Respond in the language requested. Use the supplied scheme catalog as your only source for scheme-specific details. Do not invent benefit amounts, deadlines, eligibility rules, approval status, or document requirements. If information is missing or rules may have changed, say so and direct the person to the official portal. Give practical, plain-language next steps. Ask only for non-sensitive information when needed. Never request Aadhaar numbers, bank account numbers, OTPs, passwords, or uploaded identity documents in chat. Explain that preliminary guidance is not an official eligibility decision and JanSahay AI is not a government agency. Provide official URLs when relevant. If the catalog does not cover the question, say that clearly and suggest a relevant official government portal rather than guessing.',
      prompt: 'Reply in ' + language + '. Citizen question: ' + question + '\nOptional non-sensitive profile: ' + JSON.stringify({state:profile.state||'', category:profile.category||'', occupation:profile.occupation||'', incomeBand:profile.incomeBand||'', education:profile.education||''}).slice(0,1000) + '\nScheme catalog: ' + JSON.stringify(catalog).slice(0,14000),
    });
    res.json({ answer: result.text, aiAvailable: true, source: 'JanSahay AI · scheme directory and official links', schemes: rows.filter(s => result.text.toLowerCase().includes(s.name.toLowerCase())).slice(0,5).map(s => ({name:s.name,url:s.apply_url})) });
  } catch (err) {
    const suggestions = ranked.length ? ranked : rows.slice(0,3);
    const answer = 'The AI chat service is not connected yet, so this is a directory-based starting point rather than an AI-generated answer.\\n\\n' +
      (suggestions.length ? 'These schemes may be worth checking:\\n' + suggestions.map(s => '• ' + s.name + ' (' + s.category + '): ' + s.summary + '\\nEligibility: ' + s.eligibility + '\\nOfficial portal: ' + s.apply_url).join('\\n\\n') : 'I could not find a close match in the current starter directory. Try the National Portal of India at https://www.india.gov.in/ or myScheme at https://www.myscheme.gov.in/.') +
      '\\n\\nPlease confirm current eligibility, documents and deadlines on the official portal. JanSahay AI is not a government agency and this is not an official eligibility decision.';
    return res.json({ answer, aiAvailable: false, notice: 'Configure an AI provider in Hatchable Setup to enable live AI answers.', schemes: suggestions.map(s=>({name:s.name,url:s.apply_url})) });
  }
}