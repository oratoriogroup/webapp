'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

// Admin pages store their own theme so the dashboard defaults to light
// whatever was picked on the public site.
export const themeKey = () => (location.pathname.startsWith('/admin') ? 'admin-theme' : 'theme');

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(themeKey());
    } catch {}
    setTheme(saved === 'dark' ? 'dark' : 'light');
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(themeKey(), next);
    } catch {}
    setTheme(next);
  };
  return { theme, toggle };
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-text transition-colors hover:bg-surface-2 ${className}`}
    >
      {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
