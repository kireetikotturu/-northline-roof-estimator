// server/src/controllers/estimateController.js
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { calculateEstimate, validateAnswers } from '../services/calculator.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/estimate — public. Accepts { name, phone, email, answers },
// re-fetches the active config (never trusts a config the client already
// has cached), validates, computes the range server-side, and stores the
// lead with the config_version that produced it.
export async function submitEstimate(req, res) {
  const { name, phone, email, answers } = req.body || {};

  const contactErrors = [];
  if (!name || !String(name).trim()) contactErrors.push('Name is required.');
  if (!phone || !String(phone).trim()) contactErrors.push('Phone is required.');
  if (!email || !EMAIL_RE.test(String(email).trim())) contactErrors.push('A valid email is required.');

  if (contactErrors.length) {
    return res.status(400).json({ error: 'Invalid contact details.', details: contactErrors });
  }

  const config = await Config.findOne({ active: true }).lean();
  if (!config) {
    return res.status(404).json({ error: 'No active configuration found.' });
  }

  const { valid, errors } = validateAnswers(config, answers || {});
  if (!valid) {
    return res.status(400).json({ error: 'Invalid answers.', details: errors });
  }

  const { estimate_low, estimate_high } = calculateEstimate(config, answers);

  const lead = await Lead.create({
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email).trim().toLowerCase(),
    answers,
    config_version: config.config_version,
    estimate_low,
    estimate_high,
  });

  res.status(201).json({
    lead_id: lead._id,
    estimate_low,
    estimate_high,
    currency: config.business?.currency || 'USD',
  });
}
