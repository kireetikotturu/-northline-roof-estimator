// server/src/controllers/configController.js
import { Config } from '../models/Config.js';

// GET /api/config — public. Returns ONLY what the estimator wizard needs:
// active questions (sorted), business display info, and config_version so
// the frontend can echo it back on submit. No rates for options the
// frontend doesn't render, no admin metadata.
export async function getPublicConfig(req, res) {
  const config = await Config.findOne({ active: true }).lean();

  if (!config) {
    return res.status(404).json({ error: 'No active configuration found. Run the seed script.' });
  }

  const activeQuestions = config.questions
    .filter((q) => q.active)
    .sort((a, b) => a.order - b.order)
    .map((q) => ({
      key: q.key,
      label: q.label,
      type: q.type,
      unit: q.unit,
      required: q.required,
      min: q.min,
      max: q.max,
      // Options are needed client-side to render choices and labels, but we
      // strip the pricing fields (rate_per_sqft / multiplier / tear_off_per_sqft)
      // so the browser never receives proprietary rates it could use to
      // fake a client-side calculation. See "Frontend Check" in the brief.
      options: q.options
        ? q.options.map((o) => ({ value: o.value, label: o.label }))
        : undefined,
    }));

  res.json({
    config_version: config.config_version,
    business: config.business,
    questions: activeQuestions,
  });
}
