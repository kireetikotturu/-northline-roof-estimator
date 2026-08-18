import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ business, onStart }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Blueprint grid backdrop — quiet, structural, on-theme */}
      <div
        className="pointer-events-none absolute inset-0 bg-blueprint bg-grid opacity-70 dark:opacity-30"
        style={{ maskImage: 'radial-gradient(ellipse 60% 55% at 50% 20%, black, transparent)' }}
        aria-hidden="true"
      />

      <div className="container-page relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="label-eyebrow mb-5">
            {business?.region || 'Licensed & Insured'} · Free Estimate
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-[2.5rem] leading-[1.05] font-semibold sm:text-6xl sm:leading-[1.02]"
          >
            Know what your
            <br />
            roof <span className="text-copper-500">actually costs</span>.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-md text-lg text-ink-soft dark:text-mist-soft"
          >
            {business?.tagline ||
              'Answer five quick questions about your roof and get a real cost range back — no sales call required.'}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={onStart} className="btn-primary">
              Start my estimate
              <ArrowDown size={16} className="-rotate-90" />
            </button>
            {business?.phone && (
              <span className="text-sm text-ink-soft dark:text-mist-soft">
                or call <span className="font-mono text-ink dark:text-mist">{business.phone}</span>
              </span>
            )}
          </motion.div>
        </div>

        {/* Signature element: an animated roofline that literally draws itself,
            with a pitch-angle readout — a direct visual echo of the "pitch
            multiplier" concept the estimator calculates with. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative mx-auto w-full max-w-md animate-float-slow"
        >
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <svg viewBox="0 0 360 260" className="w-full" role="img" aria-label="Diagram of a roof pitch measurement">
              <path
                d="M30 190 L180 60 L330 190"
                fill="none"
                stroke="#B5541F"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="600"
                className="animate-draw"
                style={{ '--dash': 600 }}
              />
              <path
                d="M60 190 L60 220 L300 220 L300 190"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                className="stroke-ink/25 dark:stroke-mist/25"
              />
              {/* pitch angle marker */}
              <path d="M180 60 L180 110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-ink-soft/40 dark:text-mist-soft/40" />
              <path d="M150 100 A 34 34 0 0 1 180 92" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-soft/60 dark:text-mist-soft/60" />
              <text x="118" y="105" className="fill-ink-soft dark:fill-mist-soft font-mono" fontSize="12">
                7/12 pitch
              </text>
            </svg>

            <div className="mt-2 flex items-center justify-between border-t border-ink/[0.06] pt-4 dark:border-mist/[0.08]">
              <div>
                <p className="label-eyebrow">Live formula</p>
                <p className="mt-1 font-mono text-sm text-ink-soft dark:text-mist-soft">
                  area × rate × pitch × stories
                </p>
              </div>
              <span className="rounded-full bg-copper-50 px-3 py-1 font-mono text-xs text-copper-600 dark:bg-copper-900/40 dark:text-copper-300">
                server-side
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
