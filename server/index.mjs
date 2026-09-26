import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8787);
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('tiny'));
app.use('/api/upload', express.raw({ type: '*/*', limit: '20mb' }));
app.use(express.json({ limit: '5mb' }));

const validTypes = new Set(['power_cycle', 'fit_lab']);
function typeOf(req) {
  const value = String(req.params.formType || req.query.formType || req.body?.formType || '');
  if (!validTypes.has(value)) throw Object.assign(new Error('Invalid form type'), { status: 400 });
  return value;
}
const bandFor = total => total >= 90 ? 'Exceptional' : total >= 80 ? 'Good' : total >= 70 ? 'Average' : total >= 60 ? 'Poor' : 'Needs Help';
async function db(promise) { const { data, error } = await promise; if (error) throw error; return data; }
function toLegacy(row) {
  const s = row.scores || {};
  return {
    id: row.id, trainerName: row.trainer_name, evaluatorName: row.evaluator_name, location: row.location,
    sessionName: row.session_name, classDate: row.class_date, scorePreClass: s.preClass || 0,
    scoreClientConnection: s.clientConnection ?? s.verbalCues ?? 0, scoreUspIntegration: s.uspIntegration || 0,
    scoreMapping: s.mapping ?? s.visualDemos ?? 0, scoreMusicalArc: s.musicalArc ?? s.musicChoices ?? 0,
    scoreCoachingDelivery: s.coachingDelivery ?? s.spaceManagement ?? 0, scoreMotivation: s.motivation ?? s.overallEnergy ?? 0,
    scoreTimeManagement: s.timeManagement || 0, scorePostClass: s.postClass || 0,
    scoreInjuryModifications: s.injuryModifications || 0, scoreLevelModifications: s.levelModifications || 0,
    scoreUseOfNames: s.useOfNames || 0, scoreMindfulMoment: s.mindfulMoment || 0,
    totalScore: Number(row.total_score), performanceBand: row.performance_band, keyStrengths: row.key_strengths || '',
    areasForImprovement: row.areas_for_improvement || '', coachingActionPlan: row.coaching_action_plan || '',
    sectionNotes: JSON.stringify(row.sections || {}), submittedAt: row.created_at,
  };
}

app.get('/api/health', async (_req, res, next) => { try { await db(supabase.from('trainer_assessments').select('id', { head: true })); res.json({ ok: true, database: 'connected' }); } catch (e) { next(e); } });
app.get('/api/:formType/trainers', async (req, res, next) => { try { typeOf(req); const rows = await db(supabase.from('assessment_trainers').select('*').eq('active', true).order('name')); res.json({ trainers: rows.map(r => ({ id: r.id, name: r.name, studioGroup: r.studio_group, photoUrl: r.photo_url || undefined, active: r.active })) }); } catch (e) { next(e); } });
app.post('/api/:formType/trainers', async (req, res, next) => { try { typeOf(req); const [row] = await db(supabase.from('assessment_trainers').insert({ name: req.body.name, studio_group: req.body.studioGroup, photo_url: req.body.photoUrl || null, active: req.body.active ?? true }).select('id')); res.json({ success: true, id: row.id }); } catch (e) { next(e); } });
app.patch('/api/:formType/trainers/:id', async (req, res, next) => { try { typeOf(req); const p = {}; if ('name' in req.body) p.name = req.body.name; if ('studioGroup' in req.body) p.studio_group = req.body.studioGroup; if ('photoUrl' in req.body) p.photo_url = req.body.photoUrl; if ('active' in req.body) p.active = req.body.active; await db(supabase.from('assessment_trainers').update({ ...p, updated_at: new Date().toISOString() }).eq('id', req.params.id)); res.json({ success: true }); } catch (e) { next(e); } });
app.delete('/api/:formType/trainers/:id', async (req, res, next) => { try { typeOf(req); await db(supabase.from('assessment_trainers').delete().eq('id', req.params.id)); res.json({ success: true }); } catch (e) { next(e); } });
app.get('/api/:formType/assessments', async (req, res, next) => { try { const formType = typeOf(req); let q = supabase.from('trainer_assessments').select('*').eq('form_type', formType).order('class_date', { ascending: false }).limit(500); if (req.query.trainerName) q = q.eq('trainer_name', req.query.trainerName); if (req.query.location) q = q.eq('location', req.query.location); res.json({ assessments: (await db(q)).map(toLegacy) }); } catch (e) { next(e); } });
app.get('/api/:formType/assessments/:id', async (req, res, next) => { try { const formType = typeOf(req); const rows = await db(supabase.from('trainer_assessments').select('*').eq('id', req.params.id).eq('form_type', formType).limit(1)); res.json({ assessment: rows[0] ? toLegacy(rows[0]) : null }); } catch (e) { next(e); } });
app.post('/api/:formType/assessments', async (req, res, next) => { try { const formType = typeOf(req); const scores = req.body.scores || {}; const total = Object.values(scores).reduce((sum, value) => sum + Number(value || 0), 0); const payload = { form_type: formType, trainer_name: req.body.trainerName, evaluator_name: req.body.evaluatorName, location: req.body.location, session_name: req.body.sessionName, class_date: new Date(req.body.classDate).toISOString(), scores, sections: req.body.sections || {}, total_score: total, performance_band: bandFor(total), key_strengths: req.body.strengths || '', areas_for_improvement: req.body.areasForImprovement || '', coaching_action_plan: req.body.coachingActionPlan || '' }; const [row] = await db(supabase.from('trainer_assessments').insert(payload).select('id')); if (process.env.WEBHOOK_URL) fetch(process.env.WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.WEBHOOK_SECRET ? { 'x-webhook-secret': process.env.WEBHOOK_SECRET } : {}) }, body: JSON.stringify({ id: row.id, formType, ...payload }) }).catch(console.error); res.json({ success: true, id: row.id, emailSent: false }); } catch (e) { next(e); } });
app.patch('/api/:formType/assessments/:id', async (req, res, next) => { try { const formType = typeOf(req); await db(supabase.from('trainer_assessments').update({ key_strengths: req.body.keyStrengths || '', areas_for_improvement: req.body.areasForImprovement || '', coaching_action_plan: req.body.coachingActionPlan || '', updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('form_type', formType)); res.json({ success: true }); } catch (e) { next(e); } });
app.delete('/api/:formType/assessments/:id', async (req, res, next) => { try { const formType = typeOf(req); await db(supabase.from('trainer_assessments').delete().eq('id', req.params.id).eq('form_type', formType)); res.json({ success: true }); } catch (e) { next(e); } });
app.get('/api/:formType/settings', async (req, res, next) => { try { const formType = typeOf(req); const rows = await db(supabase.from('assessment_settings').select('*').eq('form_type', formType)); const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value])); res.json({ locations: map.locations ? JSON.parse(map.locations) : ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra'], sessionTypes: map.sessionTypes ? JSON.parse(map.sessionTypes) : ['Strength Lab - Full Body', 'Strength Lab - Pull', 'Strength Lab - Push', 'Strength Lab - Practice Session'], primaryColor: map.primaryColor || '', logoUrl: map.logoUrl || '' }); } catch (e) { next(e); } });
app.put('/api/:formType/settings/:key', async (req, res, next) => { try { const formType = typeOf(req); await db(supabase.from('assessment_settings').upsert({ form_type: formType, setting_key: req.params.key, setting_value: req.body.value || '', updated_at: new Date().toISOString() })); res.json({ success: true }); } catch (e) { next(e); } });
app.post('/api/upload', async (req, res, next) => { try { const raw = String(req.headers['x-file-name'] || `upload-${Date.now()}`); const name = `${Date.now()}-${crypto.randomUUID()}-${raw.replace(/[^a-zA-Z0-9._-]/g, '-')}`; await db(supabase.storage.from('assessment-media').upload(name, req.body, { contentType: req.headers['content-type'], upsert: false })); const { data } = supabase.storage.from('assessment-media').getPublicUrl(name); res.json({ fileUrl: data.publicUrl }); } catch (e) { next(e); } });

const portal = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Physique 57 Assessment Hub</title><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui;background:#09090b;color:#fafafa;min-height:100vh;display:grid;place-items:center;padding:64px 0}.wrap{width:min(1120px,92vw)}.eyebrow{color:#f43f5e;font-weight:800;letter-spacing:.16em;font-size:12px}.title{font-size:clamp(38px,7vw,72px);line-height:.95;margin:16px 0}.sub{color:#a1a1aa;font-size:18px;max-width:720px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-top:44px}.card{color:inherit;text-decoration:none;border:1px solid #27272a;border-radius:24px;padding:28px;background:linear-gradient(145deg,#18181b,#0f0f11);transition:.2s;display:flex;flex-direction:column}.card:hover{transform:translateY(-4px);border-color:#f43f5e;box-shadow:0 20px 60px #0008}.tag{font-size:12px;color:#fb7185;text-transform:uppercase;letter-spacing:.12em}.card h2{font-size:26px;margin:14px 0 8px}.card p{color:#a1a1aa;line-height:1.5;flex:1}.go{display:inline-block;margin-top:20px;font-weight:700;color:#fff}</style></head><body><main class="wrap"><div class="eyebrow">PHYSIQUE 57 INDIA</div><h1 class="title">Training excellence,<br>one assessment hub.</h1><p class="sub">Choose the assessment or feedback experience that matches the studio touchpoint. All four forms are now accessible from one interface.</p><div class="grid"><a class="card" href="/power-cycle/"><span class="tag">Form option 01</span><h2>PowerCycle Assessment</h2><p>Evaluate coaching, connection, musical arc, motivation and the complete PowerCycle studio journey.</p><span class="go">Open assessment →</span></a><a class="card" href="/fit-lab/"><span class="tag">Form option 02</span><h2>FIT Lab Assessment</h2><p>Evaluate strength coaching, demonstrations, modifications, space management and session delivery.</p><span class="go">Open assessment →</span></a><a class="card" href="/training-quality/"><span class="tag">Form option 03</span><h2>Training Quality Assessment</h2><p>Complete the full class instruction and performance assessment imported from the attached form.</p><span class="go">Open assessment →</span></a><a class="card" href="/class-experience/"><span class="tag">Form option 04</span><h2>Class Experience Feedback</h2><p>Document the class experience, modifications, improvements and retake feedback in the attached staff form.</p><span class="go">Open feedback form →</span></a></div></main></body></html>`;
app.get('/', (_req, res) => res.type('html').send(portal));
function embeddedForm(title, publicId) {
  const formUrl = `https://forms.fillout.com/t/${publicId}`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Physique 57</title><style>*{box-sizing:border-box}html,body{height:100%;margin:0}body{font-family:Inter,ui-sans-serif,system-ui;background:#09090b;color:#fafafa;display:flex;flex-direction:column}.bar{min-height:58px;padding:10px 18px;display:flex;align-items:center;gap:16px;border-bottom:1px solid #27272a;background:#111113}.back{color:#fda4af;text-decoration:none;font-weight:700}.name{font-size:14px;font-weight:800;letter-spacing:.04em}.frame{width:100%;flex:1;border:0;background:#fff}.fallback{font-size:12px;color:#a1a1aa;margin-left:auto}.fallback a{color:#fafafa}</style></head><body><header class="bar"><a class="back" href="/">← Hub</a><span class="name">${title}</span><span class="fallback">Not loading? <a href="${formUrl}" target="_blank" rel="noreferrer">Open directly</a></span></header><iframe class="frame" title="${title}" src="${formUrl}" allow="camera; microphone; autoplay; encrypted-media" loading="eager"></iframe></body></html>`;
}
app.get(['/training-quality', '/training-quality/'], (_req, res) => res.type('html').send(embeddedForm('Training Quality Assessment', 'dSw2VkfdGqus')));
app.get(['/class-experience', '/class-experience/'], (_req, res) => res.type('html').send(embeddedForm('Class Experience Feedback', 'syTsvPww8nus')));
for (const [route, name] of [['power-cycle', 'feedback-tracker-pro'], ['fit-lab', 'trainer-qa-assessment-fit-lab']]) { const dist = path.join(root, 'apps', name, 'dist'); app.use(`/${route}`, express.static(dist)); app.get(`/${route}/*splat`, (_req, res) => res.sendFile(path.join(dist, 'index.html'))); }
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ error: err.message || 'Server error' }); });
app.listen(port, () => console.log(`Assessment Hub running on http://localhost:${port}`));
