export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'church_member_theme';

// Resolve the theme to use on load: an explicit saved choice wins, otherwise
// fall back to the OS preference so the first visit already feels right.
export function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeAttribute(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyThemeAttribute(theme);
}
