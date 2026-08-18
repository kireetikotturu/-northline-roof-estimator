import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ step, total, labels = [] }) {
  const pct = ((step + 1) / total) * 100;

  return (
    <div className="mb-8">
      <div className="mb-2.5 flex items-center justify-between text-xs">
        <span className="label-eyebrow">
          Step {Math.min(step + 1, total)} of {total}
        </span>
        {labels[step] && <span className="text-ink-soft dark:text-mist-soft">{labels[step]}</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.07] dark:bg-mist/[0.1]">
        <motion.div
          className="h-full rounded-full bg-copper-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
