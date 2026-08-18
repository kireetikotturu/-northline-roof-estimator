// server/src/models/Lead.js
//
// A Lead is a snapshot: the customer's contact info, the exact answers they
// gave, and the exact estimate range the server calculated for them at that
// moment — plus the config_version that produced it. We never recompute a
// stored lead's estimate against a newer config; that would silently change
// history. `answers` is stored as a loose object because question `key`s
// are config-driven and can change over time (see DECISIONS.md).

import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    answers: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
    config_version: { type: Number, required: true },
    estimate_low: { type: Number, required: true },
    estimate_high: { type: Number, required: true },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model('Lead', LeadSchema);
