// server/src/controllers/adminController.js
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';

// GET /api/admin/config — protected. Returns the FULL active config,
// including inactive questions and every pricing field, so the Owner
// Panel's editor has everything it needs to render toggles and rate inputs.
export async function getAdminConfig(req, res) {
  const config = await Config.findOne({ active: true });
  if (!config) {
    return res.status(404).json({ error: 'No active configuration found. Run the seed script.' });
  }
  res.json(config);
}

// PUT /api/admin/config — protected. Rather than mutating the active
// document in place, we deactivate it and insert a new document with
// config_version + 1. This keeps a full history: every past Lead still
// points at the exact config_version that produced its estimate, and a
// bad edit can be diagnosed by comparing versions. See DECISIONS.md.
export async function updateConfig(req, res) {
  const current = await Config.findOne({ active: true });
  if (!current) {
    return res.status(404).json({ error: 'No active configuration found.' });
  }

  const { business, questions, modifiers } = req.body || {};

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: '"questions" must be an array.' });
  }

  // Basic shape validation — keeps a malformed save from corrupting the
  // config a non-technical user relies on.
  for (const q of questions) {
    if (!q.key || !q.label || !['number', 'select'].includes(q.type)) {
      return res.status(400).json({ error: `Question "${q.key || '(missing key)'}" is missing required fields.` });
    }
    if (q.type === 'select' && (!Array.isArray(q.options) || q.options.length === 0)) {
      return res.status(400).json({ error: `Question "${q.key}" is type "select" but has no options.` });
    }
  }

  current.active = false;
  await current.save();

  const next = await Config.create({
    config_version: current.config_version + 1,
    active: true,
    business: { ...current.business.toObject(), ...(business || {}) },
    questions,
    modifiers: { ...current.modifiers.toObject(), ...(modifiers || {}) },
  });

  res.json(next);
}

// GET /api/admin/leads — protected. Most recent first.
export async function getLeads(req, res) {
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  res.json(leads);
}
