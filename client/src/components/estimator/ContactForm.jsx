import React, { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ contact, onChange, onSubmit, submitting, error }) {
  const [touched, setTouched] = useState({});

  const errors = {
    name: !contact.name?.trim() ? 'Enter your name.' : '',
    phone: !contact.phone?.trim() ? 'Enter a phone number.' : '',
    email: !EMAIL_RE.test(contact.email || '') ? 'Enter a valid email.' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    if (!hasErrors) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Last step — where should we send it?</h2>
        <p className="mt-1.5 text-sm text-ink-soft dark:text-mist-soft">
          We'll calculate your range the moment you submit. No spam, no obligation.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Full name</label>
        <input
          className="field-input"
          value={contact.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="Jamie Rivera"
        />
        {touched.name && errors.name && <p className="text-xs text-copper-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            className="field-input"
            value={contact.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="(555) 010-2044"
          />
          {touched.phone && errors.phone && <p className="text-xs text-copper-600">{errors.phone}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="field-input"
            value={contact.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="jamie@example.com"
          />
          {touched.email && errors.email && <p className="text-xs text-copper-600">{errors.email}</p>}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-copper-50 px-4 py-3 text-sm text-copper-700 dark:bg-copper-900/30 dark:text-copper-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full sm:w-auto">
        {submitting ? 'Calculating…' : 'Get my estimate'}
      </button>
    </form>
  );
}
