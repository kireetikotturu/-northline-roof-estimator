import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer({ business }) {
  return (
    <footer className="border-t border-ink/[0.06] py-10 dark:border-mist/[0.08]">
      <div className="container-page flex flex-col items-center justify-between gap-5 text-sm text-ink-soft dark:text-mist-soft sm:flex-row">
        <Logo />
        <p>
          © {new Date().getFullYear()} {business?.name || 'Northline Roofing & Exteriors'}. Estimates are informational, not binding quotes.
        </p>
        <Link to="/admin/login" className="transition-colors hover:text-copper-500">
          Owner Panel
        </Link>
      </div>
    </footer>
  );
}
