import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

export default function AdminLogin({ auth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await auth.login(username, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-blueprint bg-grid">
      <div className="container-page flex h-20 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink dark:text-mist-soft dark:hover:text-mist">
          <ArrowLeft size={16} /> Back to site
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card w-full max-w-sm p-8"
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <Logo />
            <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-copper-50 text-copper-600 dark:bg-copper-900/40 dark:text-copper-300">
              <Lock size={18} />
            </div>
            <h1 className="mt-3 font-display text-xl font-semibold">Owner Panel</h1>
            <p className="mt-1 text-sm text-ink-soft dark:text-mist-soft">Sign in to manage rates &amp; leads.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Username</label>
              <input className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <p className="rounded-lg bg-copper-50 px-4 py-2.5 text-sm text-copper-700 dark:bg-copper-900/30 dark:text-copper-200">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
