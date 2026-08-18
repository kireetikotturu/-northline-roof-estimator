// src/components/dynamic/QuestionField.jsx
//
// Renders exactly one question, purely from the `question` object handed
// down by the API. Nothing here is hardcoded to a specific question key,
// label, or option — swap the seed data in the Owner Panel and this
// component renders whatever comes back from GET /api/config.

import React from 'react';
import { Check } from 'lucide-react';

export default function QuestionField({ question, value, onChange }) {
  if (question.active === false) return null;

  if (question.type === 'number') {
    return (
      <div className="flex flex-col gap-2">
        <label className="font-display text-lg font-medium">
          {question.label}
          {question.unit ? <span className="ml-1.5 text-sm font-normal text-ink-soft dark:text-mist-soft">({question.unit})</span> : null}
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          value={value ?? ''}
          onChange={(e) => onChange(question.key, e.target.value === '' ? '' : Number(e.target.value))}
          className="field-input text-lg"
          placeholder={
            question.min != null && question.max != null
              ? `Between ${question.min} and ${question.max}`
              : 'Enter a value'
          }
          required={question.required}
        />
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="flex flex-col gap-3">
        <label className="font-display text-lg font-medium">{question.label}</label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {(question.options || []).map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => onChange(question.key, opt.value)}
                aria-pressed={selected}
                className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium
                  transition-all duration-150
                  ${
                    selected
                      ? 'border-copper-500 bg-copper-50 text-copper-700 dark:bg-copper-900/30 dark:text-copper-200'
                      : 'border-ink/12 bg-surface text-ink hover:border-copper-400/60 dark:border-mist/12 dark:bg-onyx-soft dark:text-mist'
                  }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors
                    ${selected ? 'border-copper-500 bg-copper-500 text-white' : 'border-ink/20 dark:border-mist/20'}`}
                >
                  {selected && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
