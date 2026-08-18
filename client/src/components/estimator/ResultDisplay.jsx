import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, PhoneCall } from 'lucide-react';

function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

const currencyFmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

export default function ResultDisplay({ result, business, onRestart }) {
  const low = useCountUp(result.estimate_low);
  const high = useCountUp(result.estimate_high);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-copper-50 text-copper-600 dark:bg-copper-900/40 dark:text-copper-300">
        <CheckCircle2 size={26} />
      </div>

      <h2 className="mt-5 font-display text-2xl font-semibold sm:text-3xl">Your estimated range</h2>
      <p className="mt-1.5 text-sm text-ink-soft dark:text-mist-soft">
        Based on what you told us. A final quote comes after an on-site visit.
      </p>

      <p className="mt-8 font-display text-4xl font-semibold text-copper-500 sm:text-5xl">
        {currencyFmt(low, result.currency)}
        <span className="mx-2 text-ink-soft dark:text-mist-soft">–</span>
        {currencyFmt(high, result.currency)}
      </p>

      <div className="mx-auto mt-10 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        {business?.phone && (
          <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="btn-primary">
            <PhoneCall size={16} /> Call {business.name?.split(' ')[0] || 'us'}
          </a>
        )}
        <button onClick={onRestart} className="btn-secondary">
          Start a new estimate
        </button>
      </div>
    </motion.div>
  );
}
