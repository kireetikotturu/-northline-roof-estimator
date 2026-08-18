import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/[0.06] bg-paper/80 backdrop-blur-md transition-colors dark:border-mist/[0.08] dark:bg-onyx/80">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link to="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/admin/login"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-copper-500 dark:text-mist-soft sm:flex"
          >
            <ShieldCheck size={15} />
            Owner Panel
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
