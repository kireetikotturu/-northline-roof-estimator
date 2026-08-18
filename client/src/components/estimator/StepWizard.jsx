// src/components/estimator/StepWizard.jsx
//
// Orchestrates the whole public flow: fetch config -> step through
// config-driven questions -> capture contact -> POST /api/estimate ->
// show the returned range. Every question rendered here comes straight
// from GET /api/config; nothing about the form's shape is hardcoded.

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import QuestionField from '../dynamic/QuestionField.jsx';
import ProgressBar from './ProgressBar.jsx';
import ContactForm from './ContactForm.jsx';
import ResultDisplay from './ResultDisplay.jsx';
import { fetchPublicConfig, submitEstimate } from '../../services/api.js';

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

export default function StepWizard({ wizardRef }) {
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchPublicConfig()
      .then(setConfig)
      .catch(() => setLoadError('We could not load the estimator right now. Please refresh or call us directly.'));
  }, []);

  const questions = config?.questions || [];
  const totalSteps = questions.length + 1; // + contact step
  const onContactStep = stepIndex === questions.length;
  const currentQuestion = !onContactStep ? questions[stepIndex] : null;

  const canAdvance = () => {
    if (!currentQuestion) return true;
    const val = answers[currentQuestion.key];
    if (!currentQuestion.required) return true;
    return val !== undefined && val !== '' && val !== null;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStepIndex((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((s) => Math.max(s - 1, 0));
  };

  const handleAnswerChange = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const handleContactChange = (key, value) => setContact((c) => ({ ...c, [key]: value }));

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = await submitEstimate({ ...contact, answers });
      setResult(data);
    } catch (err) {
      const apiMsg = err?.response?.data?.error;
      setSubmitError(apiMsg || 'Something went wrong calculating your estimate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setContact({ name: '', phone: '', email: '' });
    setStepIndex(0);
    setResult(null);
    setSubmitError('');
  };

  return (
    <section ref={wizardRef} id="estimator" className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-xl">
          <div className="card p-6 sm:p-10">
            {loadError && (
              <p className="rounded-lg bg-copper-50 px-4 py-3 text-sm text-copper-700 dark:bg-copper-900/30 dark:text-copper-200">
                {loadError}
              </p>
            )}

            {!config && !loadError && (
              <div className="flex flex-col items-center gap-3 py-16 text-ink-soft dark:text-mist-soft">
                <Loader2 className="animate-spin" size={22} />
                <p className="text-sm">Loading the estimator…</p>
              </div>
            )}

            {config && !result && (
              <>
                <ProgressBar
                  step={stepIndex}
                  total={totalSteps}
                  labels={[...questions.map((q) => q.label), 'Your details']}
                />

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={onContactStep ? 'contact' : currentQuestion.key}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {onContactStep ? (
                      <ContactForm
                        contact={contact}
                        onChange={handleContactChange}
                        onSubmit={handleFinalSubmit}
                        submitting={submitting}
                        error={submitError}
                      />
                    ) : (
                      <QuestionField question={currentQuestion} value={answers[currentQuestion.key]} onChange={handleAnswerChange} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {!onContactStep && (
                  <div className="mt-9 flex items-center justify-between">
                    <button
                      onClick={goBack}
                      disabled={stepIndex === 0}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-0 dark:text-mist-soft dark:hover:text-mist"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button onClick={goNext} disabled={!canAdvance()} className="btn-primary">
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                )}
                {onContactStep && stepIndex > 0 && (
                  <button
                    onClick={goBack}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink dark:text-mist-soft dark:hover:text-mist"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
              </>
            )}

            {result && <ResultDisplay result={result} business={config?.business} onRestart={restart} />}
          </div>
        </div>
      </div>
    </section>
  );
}
