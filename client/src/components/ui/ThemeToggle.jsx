import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-9 w-16 items-center rounded-full border border-ink/15 bg-surface px-1
        transition-colors dark:border-mist/15 dark:bg-onyx-soft"
    >
      <motion.span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-copper-500 text-white shadow-soft"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {isDark ? <Moon size={14} strokeWidth={2.5} /> : <Sun size={14} strokeWidth={2.5} />}
      </motion.span>
    </button>
  );
}
