// server/src/models/Config.js
//
// A "Config" document is the single source of truth for everything the
// Public Estimator renders and everything the pricing engine calculates
// with. There is only ever one config document that matters — the one
// with `active: true`. Saving changes in the Owner Panel creates a fresh
// version (see adminController.updateConfig) rather than mutating history,
// so old leads can always be traced back to the exact config that produced
// their estimate via `config_version`.

import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true }, // stable key, e.g. "architectural"
    label: { type: String, required: true }, // human label, e.g. "Architectural Shingle"
    rate_per_sqft: { type: Number }, // used by `material` questions
    multiplier: { type: Number }, // used by `pitch` / `stories` questions
    tear_off_per_sqft: { type: Number }, // used by `layers` questions
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // e.g. "roof_area", must be unique within a config
    label: { type: String, required: true },
    type: { type: String, enum: ['number', 'select'], required: true },
    unit: { type: String, default: '' }, // e.g. "sq ft"
    required: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order in the wizard
    min: { type: Number },
    max: { type: Number },
    active: { type: Boolean, default: true },
    options: { type: [OptionSchema], default: undefined }, // only present for type: 'select'
  },
  { _id: false }
);

const ConfigSchema = new mongoose.Schema(
  {
    config_version: { type: Number, required: true, default: 1 },
    active: { type: Boolean, default: true, index: true },
    business: {
      name: { type: String, default: 'Northline Roofing & Exteriors' },
      region: { type: String, default: '' },
      currency: { type: String, default: 'USD' },
      phone: { type: String, default: '' },
      tagline: { type: String, default: '' },
    },
    questions: { type: [QuestionSchema], default: [] },
    modifiers: {
      waste_factor: { type: Number, default: 0.1 }, // 10%
      permit_flat_fee: { type: Number, default: 350 }, // flat $
      range_spread_pct: { type: Number, default: 12 }, // stored as a whole percent (12 = 12%)
    },
  },
  { timestamps: true }
);

export const Config = mongoose.model('Config', ConfigSchema);
