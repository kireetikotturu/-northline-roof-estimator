// server/src/services/calculator.js
//
// The ONLY place price math happens. The frontend never sees rates or
// multipliers beyond what it needs to render a form — it only ever
// receives the final { estimate_low, estimate_high } numbers back from
// POST /api/estimate. See DECISIONS.md for the plain-language walkthrough
// of this formula.

export function calculateEstimate(config, answers) {
  const { questions, modifiers } = config;

  const roofArea = Number(answers['roof_area'] || 0);

  const getSelectedOption = (questionKey) => {
    const q = questions.find((item) => item.key === questionKey);
    if (!q || !q.options) return null;
    const selectedValue = answers[questionKey];
    return q.options.find((opt) => opt.value === selectedValue) || null;
  };

  const materialOpt = getSelectedOption('material');
  const pitchOpt = getSelectedOption('pitch');
  const layersOpt = getSelectedOption('layers');
  const storiesOpt = getSelectedOption('stories');

  // Parse numbers defensively — seed/legacy data has stored some of these
  // as numeric strings (e.g. multiplier: "1.12"), and Number() normalizes both.
  const ratePerSqft = Number(materialOpt?.rate_per_sqft || 0);
  const pitchMult = Number(pitchOpt?.multiplier ?? 1.0);
  const tearOffPerSqft = Number(layersOpt?.tear_off_per_sqft || 0);
  const storiesMult = Number(storiesOpt?.multiplier ?? 1.0);

  const wasteFactor = Number(modifiers.waste_factor ?? 0.1);
  const permitFee = Number(modifiers.permit_flat_fee ?? 350);
  const spreadPct = Number(modifiers.range_spread_pct ?? 12) / 100;

  const baseMaterialCost = roofArea * ratePerSqft * (1 + wasteFactor);
  const tearOffCost = roofArea * tearOffPerSqft;
  const subtotal = (baseMaterialCost + tearOffCost) * pitchMult * storiesMult;
  const midPointEstimate = subtotal + permitFee;

  const estimateLow = Math.round(midPointEstimate * (1 - spreadPct));
  const estimateHigh = Math.round(midPointEstimate * (1 + spreadPct));

  return {
    estimate_low: estimateLow,
    estimate_high: estimateHigh,
  };
}

/**
 * Validates a raw `answers` payload against the active config's active
 * questions. Returns { valid: boolean, errors: string[] }.
 * Runs server-side so the frontend can never bypass min/max or required
 * checks by tampering with client-side JS.
 */
export function validateAnswers(config, answers) {
  const errors = [];
  const activeQuestions = config.questions.filter((q) => q.active);

  for (const q of activeQuestions) {
    const value = answers ? answers[q.key] : undefined;
    const isEmpty = value === undefined || value === null || value === '';

    if (q.required && isEmpty) {
      errors.push(`"${q.label}" is required.`);
      continue;
    }
    if (isEmpty) continue;

    if (q.type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors.push(`"${q.label}" must be a number.`);
        continue;
      }
      if (typeof q.min === 'number' && num < q.min) {
        errors.push(`"${q.label}" must be at least ${q.min}.`);
      }
      if (typeof q.max === 'number' && num > q.max) {
        errors.push(`"${q.label}" must be at most ${q.max}.`);
      }
    }

    if (q.type === 'select') {
      const validValues = (q.options || []).map((o) => o.value);
      if (!validValues.includes(value)) {
        errors.push(`"${q.label}" has an invalid selection.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
