import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import LeadsTable from '../components/owner/LeadsTable.jsx';
import ConfigEditor from '../components/owner/ConfigEditor.jsx';

const TABS = [
  { id: 'leads', label: 'Leads' },
  { id: 'config', label: 'Pricing & questions' },
];

export default function AdminDashboard({ auth }) {
  const [tab, setTab] = useState('leads');
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/[0.06] dark:border-mist/[0.08]">
        <div className="container-page flex h-16 items-center justify-between sm:h-20">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-copper-500 dark:text-mist-soft"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page py-8 sm:py-12">
        <a href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink dark:text-mist-soft dark:hover:text-mist">
          <ArrowLeft size={14} /> View public estimator
        </a>

        <h1 className="mb-1 font-display text-2xl font-semibold sm:text-3xl">Owner Panel</h1>
        <p className="mb-8 text-sm text-ink-soft dark:text-mist-soft">Update rates, toggle questions, and review captured leads.</p>

        <div className="mb-8 inline-flex rounded-full border border-ink/[0.08] bg-surface p-1 dark:border-mist/[0.1] dark:bg-onyx-soft">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-copper-500 text-white' : 'text-ink-soft hover:text-ink dark:text-mist-soft dark:hover:text-mist'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'leads' ? <LeadsTable /> : <ConfigEditor />}
      </main>
    </div>
  );
}
