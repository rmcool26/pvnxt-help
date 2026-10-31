// pvNXT Help assistant: answers only from the guides in js/data.js.
// Vercel serverless function. Set ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables.
// Optional: CHAT_MODEL (default claude-haiku-5-5).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let HELP = null;
function load() {
  if (HELP) return HELP;
  const src = fs.readFileSync(path.join(process.cwd(), 'js', 'data.js'), 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  HELP = ctx.window.HELP; return HELP;
}
const strip = (s) => String(s || '').replace(/<[^>]+>/g, '');
function textOf(a) {
  return a.body.map((b) => {
    if (b[0] === 'img') return '';
    if (b[0] === 'h') return '\n## ' + strip(b[1]);
    if (Array.isArray(b[1])) return b[1].map((x, i) => (b[0] === 'steps' ? (i + 1) + '. ' : '- ') + strip(x)).join('\n');
    return (b[0] === 'p' ? '' : b[0].toUpperCase() + ': ') + strip(b[1]);
  }).filter(Boolean).join('\n');
}
function find(H, q) {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const score = (t, w) => { t = t.toLowerCase(); let s = 0; words.forEach((x) => { if (t.includes(x)) s += w; }); return s; };
  const P = (id) => H.portals.find((p) => p.id === id) || { name: '' };
  return H.articles.map((a) => ({ a, s: score(a.title, 6) + score(a.sum, 3) + score(textOf(a), 1) + score(P(a.p).name, 2) }))
    .filter((r) => r.s > 0).sort((x, y) => y.s - x.s).slice(0, 4).map((r) => r.a);
}

const hits = new Map(); // best-effort rate limit per instance
function limited(ip) {
  const now = Date.now(), win = 60 * 1000, max = 12;
  const list = (hits.get(ip) || []).filter((t) => now - t < win); list.push(now); hits.set(ip, list);
  return list.length > max;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: 'Assistant not configured' }); return; }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  if (limited(ip)) { res.status(429).json({ error: 'Too many questions. Try again in a minute.' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const question = String((body && body.question) || '').slice(0, 500).trim();
  if (!question) { res.status(400).json({ error: 'Empty question' }); return; }
  const history = Array.isArray(body.history) ? body.history.slice(-6).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map((m) => ({ role: m.role, content: m.content.slice(0, 1500) })) : [];
  const lang = { hi: 'Hindi', ar: 'Arabic' }[body.lang] || 'English';

  const H = load();
  const P = (id) => H.portals.find((p) => p.id === id) || { name: '' };
  const guides = find(H, question + ' ' + history.filter((m) => m.role === 'user').map((m) => m.content).join(' '));
  const context = guides.map((a) => `<guide id="${a.id}" portal="${P(a.p).name}" title="${a.title}">\n${a.sum}\n${textOf(a)}\n</guide>`).join('\n\n');
  const s = H.support;
  const system = `You are the pvNXT Help assistant for Terranxt's solar portals (Studio for EPC teams, Go for installers, Connect for homeowners, SCADA for O&M, Atlas 3D roof models, Artha for investors).
Answer ONLY from the guides below. If they don't contain the answer, say so plainly and suggest contacting support: ${s.email}, WhatsApp, ${s.hours}. ${s.reply}
Never invent features, prices, timelines, policies or steps. Never ask for passwords, OTPs or card details.
Style: short and calm. At most 6 numbered steps. Put button and screen names in **bold** exactly as in the guide. Name the guide to open by its title. No headings, no emoji.
Reply in ${lang}, but keep portal names, button names and screen names in English as they appear in the portal.

${context || '(No matching guides were found.)'}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.CHAT_MODEL || 'claude-haiku-5-5', max_tokens: 600, system, messages: history.concat([{ role: 'user', content: question }]) })
    });
    if (!r.ok) { res.status(502).json({ error: 'Assistant unavailable' }); return; }
    const d = await r.json();
    const answer = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    res.status(200).json({ answer, sources: guides.slice(0, 3).map((a) => ({ id: a.id, title: a.title })) });
  } catch (e) {
    res.status(502).json({ error: 'Assistant unavailable' });
  }
};
