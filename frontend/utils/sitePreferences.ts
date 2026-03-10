import type { SiteSettings } from './store';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();
  if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) return trimmed.toLowerCase();
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = normalized.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) => clamp(channel, 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColor(hex: string, target: { r: number; g: number; b: number }, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r + (target.r - rgb.r) * amount);
  const g = Math.round(rgb.g + (target.g - rgb.g) * amount);
  const b = Math.round(rgb.b + (target.b - rgb.b) * amount);
  return rgbToHex(r, g, b);
}

export function resolveThemeMode(settings: SiteSettings): 'light' | 'dark' {
  if (settings.themeMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return settings.themeMode;
}

export function applySiteSettings(settings: SiteSettings): void {
  const resolvedTheme = resolveThemeMode(settings);
  const body = document.body;
  body.classList.toggle('dark-mode', resolvedTheme === 'dark');
  body.classList.toggle('density-compact', settings.density === 'compact');
  body.classList.toggle('density-comfortable', settings.density === 'comfortable');

  const root = document.documentElement;
  const primary = normalizeHex(settings.accentColor) || '#667eea';
  const secondary = mixColor(primary, { r: 0, g: 0, b: 0 }, 0.18);
  const primaryDark = mixColor(primary, { r: 0, g: 0, b: 0 }, 0.12);
  const primaryLight = mixColor(primary, { r: 255, g: 255, b: 255 }, 0.78);

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--primary-dark', primaryDark);
  root.style.setProperty('--primary-light', primaryLight);
}
