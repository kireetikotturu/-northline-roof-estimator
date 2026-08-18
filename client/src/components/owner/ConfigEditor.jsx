// src/components/owner/ConfigEditor.jsx
//
// Lets Dale/Marcus edit prices and question copy without touching code.
// Deliberately generic: it doesn't assume which pricing field a question's
// options use (rate_per_sqft / multiplier / tear_off_per_sqft) — it just
// renders whichever of those fields is already present on each option, so
// this editor keeps working even if the seed data's shape evolves.

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { fetchAdminConfig, saveAdminConfig } from '../../services/api.js';

const PRICING_FIELDS = [
  { key: 'rate_per_sqft', label: 'Rate / sq ft' },
  { key: 'multiplier', label: 'Multiplier' },
  { key: 'tear_off_per_sqft', label: 'Tear-off / sq ft' },
];

function humanizeKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ConfigEditor() {
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState(null); // 'ok' | 'error' | null
  const [saveMessage, setSaveMessage] = useState('');

  const load = () => {
    fetchAdminConfig()
      .then(setConfig)
      .catch(() => setLoadError('Could not load the configuration.'));
  };

  useEffect(load, []);

  const updateQuestion = (index, patch) => {
    setConfig((c) => {
      const questions = [...c.questions];
      questions[index] = { ...questions[index], ...patch };
      return { ...c, questions };
    });
  };

  const updateOption = (qIndex, oIndex, patch) => {
    setConfig((c) => {
      const questions = [...c.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = { ...options[oIndex], ...patch };
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...c, questions };
    });
  };

  const updateModifier = (key, value) => {
    setConfig((c) => ({ ...c, modifiers: { ...c.modifiers, [key]: value } }));
  };

  const updateBusiness = (key, value) => {
    setConfig((c) => ({ ...c, business: { ...c.business, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveState(null);
    try {
      const next = await saveAdminConfig({
        business: config.business,
        questions: config.questions,
        modifiers: config.modifiers,
      });
      setConfig(next);
      setSaveState('ok');
      setSaveMessage(`Saved — now live as config v${next.config_version}.`);
    } catch (err) {
      setSaveState('error');
      setSaveMessage(err?.response?.data?.error || 'Save failed. Please check your inputs.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveState(null), 4000);
    }
  };

  if (loadError) return <p className="card p-6 text-sm text-copper-600">{loadError}</p>;
  if (!config) return <p className="card p-6 text-sm text-ink-soft dark:text-mist-soft">Loading configuration…</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Business info */}
      <div className="card p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Business details</h2>
        <p className="mb-5 text-sm text-ink-soft dark:text-mist-soft">Shown to customers on the public estimator.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business name" value={config.business.name} onChange={(v) => updateBusiness('name', v)} />
          <Field label="Phone" value={config.business.phone} onChange={(v) => updateBusiness('phone', v)} />
          <Field label="Region" value={config.business.region} onChange={(v) => updateBusiness('region', v)} />
          <Field label="Currency code" value={config.business.currency} onChange={(v) => updateBusiness('currency', v)} />
          <div className="sm:col-span-2">
            <Field label="Tagline" value={config.business.tagline} onChange={(v) => updateBusiness('tagline', v)} />
          </div>
        </div>
      </div>

      {/* Global modifiers */}
      <div className="card p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Global pricing modifiers</h2>
        <p className="mb-5 text-sm text-ink-soft dark:text-mist-soft">Applied to every estimate, regardless of answers.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="Waste factor (0–1)"
            type="number"
            step="0.01"
            value={config.modifiers.waste_factor}
            onChange={(v) => updateModifier('waste_factor', Number(v))}
          />
          <Field
            label="Permit flat fee ($)"
            type="number"
            value={config.modifiers.permit_flat_fee}
            onChange={(v) => updateModifier('permit_flat_fee', Number(v))}
          />
          <Field
            label="Range spread (%)"
            type="number"
            value={config.modifiers.range_spread_pct}
            onChange={(v) => updateModifier('range_spread_pct', Number(v))}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {config.questions.map((q, qIndex) => (
          <div key={q.key} className="card p-5 sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="label-eyebrow">{q.key}</span>
                <input
                  className="field-input mt-1.5 font-display text-base font-medium"
                  value={q.label}
                  onChange={(e) => updateQuestion(qIndex, { label: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => updateQuestion(qIndex, { active: !q.active })}
                className="mt-6 flex items-center gap-2 text-sm font-medium"
                title={q.active ? 'Visible on public estimator' : 'Hidden from public estimator'}
              >
                {q.active ? (
                  <ToggleRight className="text-copper-500" size={26} />
                ) : (
                  <ToggleLeft className="text-ink-soft dark:text-mist-soft" size={26} />
                )}
                <span className={q.active ? 'text-copper-600 dark:text-copper-300' : 'text-ink-soft dark:text-mist-soft'}>
                  {q.active ? 'Active' : 'Hidden'}
                </span>
              </button>
            </div>

            {q.type === 'number' && (
              <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
                <Field label="Min" type="number" value={q.min} onChange={(v) => updateQuestion(qIndex, { min: Number(v) })} />
                <Field label="Max" type="number" value={q.max} onChange={(v) => updateQuestion(qIndex, { max: Number(v) })} />
              </div>
            )}

            {q.type === 'select' && (
              <div className="flex flex-col gap-3">
                {q.options.map((opt, oIndex) => (
                  <div
                    key={opt.value}
                    className="grid grid-cols-1 items-center gap-3 rounded-xl border border-ink/[0.08] p-3 dark:border-mist/[0.1] sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      className="field-input !py-2"
                      value={opt.label}
                      onChange={(e) => updateOption(qIndex, oIndex, { label: e.target.value })}
                    />
                    <div className="flex flex-wrap gap-3">
                      {PRICING_FIELDS.filter((f) => opt[f.key] !== undefined).map((f) => (
                        <label key={f.key} className="flex items-center gap-2 text-xs text-ink-soft dark:text-mist-soft">
                          {f.label}
                          <input
                            type="number"
                            step="0.01"
                            className="field-input !w-24 !py-1.5 font-mono"
                            value={opt[f.key]}
                            onChange={(e) => updateOption(qIndex, oIndex, { [f.key]: Number(e.target.value) })}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-5 flex items-center justify-between gap-4 rounded-2xl border border-ink/[0.08] bg-surface/90 p-4 shadow-soft backdrop-blur dark:border-mist/[0.1] dark:bg-onyx-card/90 sm:p-5">
        <div className="flex items-center gap-2 text-sm">
          {saveState === 'ok' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} /> {saveMessage}
            </span>
          )}
          {saveState === 'error' && (
            <span className="flex items-center gap-1.5 text-copper-600 dark:text-copper-300">
              <AlertTriangle size={16} /> {saveMessage}
            </span>
          )}
          {!saveState && <span className="text-ink-soft dark:text-mist-soft">Currently live: config v{config.config_version}</span>}
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary !px-5 !py-2.5">
          <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', step }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-soft dark:text-mist-soft">{label}</label>
      <input
        type={type}
        step={step}
        className="field-input !py-2.5"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
