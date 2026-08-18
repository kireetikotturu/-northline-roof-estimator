// server/src/config/seed.js
//
// Seeds the database with an initial, active Config document (version 3 —
// see DECISIONS.md for why we start numbering at 3 and how legacy
// versions are treated) and a couple of demo leads so the Owner Panel
// isn't empty on first login.
//
// Run with: npm run seed   (from the server/ directory, or `npm run seed`
// from the repo root, which proxies into server/).

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { calculateEstimate } from '../services/calculator.js';

const seedConfig = {
  config_version: 3,
  active: true,
  business: {
    name: 'Northline Roofing & Exteriors',
    region: 'Pacific Northwest',
    currency: 'USD',
    phone: '(555) 014-2277',
    tagline: 'Straight answers on what your roof actually costs.',
  },
  questions: [
    {
      key: 'roof_area',
      label: 'Approximate roof area',
      type: 'number',
      unit: 'sq ft',
      required: true,
      order: 1,
      min: 400,
      max: 12000,
      active: true,
    },
    {
      key: 'material',
      label: 'Roofing material',
      type: 'select',
      required: true,
      order: 2,
      active: true,
      options: [
        { value: 'asphalt_3tab', label: '3-Tab Asphalt Shingle', rate_per_sqft: 4.25 },
        { value: 'architectural', label: 'Architectural Shingle', rate_per_sqft: 5.75 },
        { value: 'metal', label: 'Standing Seam Metal', rate_per_sqft: 9.5 },
        { value: 'tile', label: 'Concrete Tile', rate_per_sqft: 12.0 },
      ],
    },
    {
      key: 'pitch',
      label: 'Roof pitch',
      type: 'select',
      required: true,
      order: 3,
      active: true,
      options: [
        { value: 'low', label: 'Low (2/12 – 4/12)', multiplier: 1.0 },
        { value: 'medium', label: 'Medium (5/12 – 8/12)', multiplier: 1.12 },
        { value: 'steep', label: 'Steep (9/12 or greater)', multiplier: 1.35 },
      ],
    },
    {
      key: 'stories',
      label: 'Number of stories',
      type: 'select',
      required: true,
      order: 4,
      active: true,
      options: [
        { value: '1', label: '1 story', multiplier: 1.0 },
        { value: '2', label: '2 stories', multiplier: 1.15 },
        { value: '3', label: '3+ stories', multiplier: 1.3 },
      ],
    },
    {
      key: 'layers',
      label: 'Existing layers to tear off',
      type: 'select',
      required: true,
      order: 5,
      active: true,
      options: [
        { value: 'none', label: 'New construction / bare deck', tear_off_per_sqft: 0 },
        { value: 'one', label: '1 existing layer', tear_off_per_sqft: 1.25 },
        { value: 'two_plus', label: '2+ existing layers', tear_off_per_sqft: 2.0 },
      ],
    },
  ],
  modifiers: {
    waste_factor: 0.1,
    permit_flat_fee: 350,
    range_spread_pct: 12,
  },
};

async function run() {
  await connectDB();

  // Deactivate any existing configs, then insert the seed as the single active one.
  await Config.updateMany({}, { $set: { active: false } });
  const existing = await Config.findOne({ config_version: seedConfig.config_version });
  let config;
  if (existing) {
    Object.assign(existing, seedConfig);
    config = await existing.save();
    console.log(`[seed] updated existing config_version ${config.config_version}`);
  } else {
    config = await Config.create(seedConfig);
    console.log(`[seed] inserted config_version ${config.config_version}`);
  }

  // Demo leads (only if the collection is empty, so re-running seed is safe).
  const leadCount = await Lead.countDocuments();
  if (leadCount === 0) {
    const demoAnswers = [
      { name: 'Marissa Cole', phone: '555-201-4488', email: 'marissa.cole@example.com', answers: { roof_area: 2200, material: 'architectural', pitch: 'medium', stories: '1', layers: 'one' } },
      { name: 'Devon Park', phone: '555-330-9021', email: 'devon.park@example.com', answers: { roof_area: 3400, material: 'metal', pitch: 'steep', stories: '2', layers: 'none' } },
    ];

    const docs = demoAnswers.map((d) => {
      const { estimate_low, estimate_high } = calculateEstimate(config, d.answers);
      return { ...d, config_version: config.config_version, estimate_low, estimate_high };
    });

    await Lead.insertMany(docs);
    console.log(`[seed] inserted ${docs.length} demo leads`);
  } else {
    console.log('[seed] leads already present, skipping demo leads');
  }

  await mongoose.disconnect();
  console.log('[seed] done');
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
