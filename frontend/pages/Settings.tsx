import { useEffect, useMemo, useRef, useState } from 'react';
import { applySiteSettings, resolveThemeMode } from '../utils/sitePreferences';
import * as api from '../utils/api';
import {
  getUserData,
  getSiteSettings,
  saveSiteSettings,
  type SiteSettings
} from '../utils/store';
import '../styles/settings.css';

const accentSwatches = ['#667eea', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];
const languageOptions: Array<{ value: SiteSettings['language']; label: string; locale: string }> = [
  { value: 'en', label: 'English', locale: 'en-US' },
  { value: 'hi', label: 'Hindi', locale: 'hi-IN' },
  { value: 'ta', label: 'Tamil', locale: 'ta-IN' },
  { value: 'es', label: 'Spanish', locale: 'es-ES' },
  { value: 'fr', label: 'French', locale: 'fr-FR' }
];

function normalizeThemeMode(value: unknown): SiteSettings['themeMode'] {
  if (value === 'dark') return 'dark';
  if (value === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>(() => getSiteSettings());
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(() => getSiteSettings());
  const [accountInfo, setAccountInfo] = useState<{ username: string; email: string }>(() => {
    const user = getUserData();
    return {
      username: user?.name || '',
      email: user?.email || '',
    };
  });
  const [saved, setSaved] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    applySiteSettings(settings);
  }, [settings]);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('authToken');
    if (!hasToken) return;

    const loadServerData = async () => {
      try {
        const serverSettings: any = await api.getSettings();
        const normalized: SiteSettings = {
          themeMode: normalizeThemeMode(serverSettings.themeMode || serverSettings.theme || settings.themeMode),
          density: serverSettings.density || 'comfortable',
          sidebarBehavior: serverSettings.sidebarBehavior || 'expanded',
          language: serverSettings.language || 'en',
          timeFormat: serverSettings.timeFormat || '12h',
          accentColor: serverSettings.accentColor || '#667eea',
          practiceName: serverSettings.practiceName || 'Therapy',
        };
        setSettings(normalized);
        setDraftSettings(normalized);
        saveSiteSettings(normalized);
        window.dispatchEvent(new CustomEvent('site-settings-updated'));
      } catch (err) {
        console.error('Failed to load server settings, using local settings.', err);
      }

      try {
        const me: any = await api.getCurrentUser();
        setAccountInfo({
          username: me?.fullName || me?.name || me?.username || '',
          email: me?.email || '',
        });
      } catch (err) {
        console.error('Failed to load account details for settings page.', err);
      }
    };

    loadServerData();
  }, []);

  function markSaved() {
    setSaved(true);
    if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => setSaved(false), 2000);
  }

  function updateDraft(next: Partial<SiteSettings>) {
    const merged = { ...draftSettings, ...next };
    setDraftSettings(merged);
    setHasPendingChanges(true);
  }

  async function saveChanges() {
    const normalizedPracticeName = (draftSettings.practiceName || '').trim();
    const merged = {
      ...draftSettings,
      practiceName: normalizedPracticeName || 'Therapy'
    };

    const hasToken = !!localStorage.getItem('authToken');
    if (hasToken) {
      try {
        await api.updateSettings({
          themeMode: merged.themeMode,
          theme: merged.themeMode,
          density: merged.density,
          sidebarBehavior: merged.sidebarBehavior,
          language: merged.language,
          timeFormat: merged.timeFormat,
          accentColor: merged.accentColor,
          practiceName: merged.practiceName,
        });
      } catch (err) {
        console.error('Failed to save settings to server, using local save.', err);
      }
    }

    setSettings(merged);
    setDraftSettings(merged);
    saveSiteSettings(merged);

    window.dispatchEvent(new CustomEvent('site-settings-updated'));
    setHasPendingChanges(false);
    markSaved();
  }

  function discardChanges() {
    setDraftSettings(settings);
    setHasPendingChanges(false);
  }

  const resolvedTheme = resolveThemeMode(settings);
  const languageOption = languageOptions.find((option) => option.value === settings.language);
  const languageLocale = languageOption?.locale || 'en-US';
  const accentColorValue = /^#([0-9a-fA-F]{6})$/.test(draftSettings.accentColor) ? draftSettings.accentColor : '#667eea';
  const previewTime = useMemo(() => {
    return new Intl.DateTimeFormat(languageLocale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: draftSettings.timeFormat === '12h'
    }).format(new Date());
  }, [languageLocale, draftSettings.timeFormat]);

  return (
    <section className="page active">
      <div className="page-header">
        <div className="page-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6" />
            <path d="M12 17v6" />
            <path d="M4.22 4.22l4.24 4.24" />
            <path d="M15.54 15.54l4.24 4.24" />
            <path d="M1 12h6" />
            <path d="M17 12h6" />
            <path d="M4.22 19.78l4.24-4.24" />
            <path d="M15.54 8.46l4.24-4.24" />
          </svg>
        </div>
        <div className="page-header-content">
          <h2>Settings</h2>
          <p className="page-subtitle">Website preferences and display options</p>
        </div>
        <div className="settings-header-controls">
          <div className={`settings-saved ${saved ? 'is-visible' : ''}`} aria-live="polite">
            Saved
          </div>
          <div className="settings-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={discardChanges}
              disabled={!hasPendingChanges}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={saveChanges}
              disabled={!hasPendingChanges}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h3>Account</h3>
          <p className="settings-section-desc">Your registered account details</p>

          <div className="setting-row">
            <div>
              <p className="setting-title">Username</p>
              <p className="setting-desc">Name on your account profile</p>
            </div>
            <div className="setting-static">{accountInfo.username || 'Not available'}</div>
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Email</p>
              <p className="setting-desc">Registered login email</p>
            </div>
            <div className="setting-static">{accountInfo.email || 'Not available'}</div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <p className="settings-section-desc">Control how the website looks and feels</p>

          <div className="setting-row">
            <div>
              <p className="setting-title">Theme</p>
              <p className="setting-desc">Choose between light and dark mode</p>
            </div>
            <div className="segmented">
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`segmented-btn ${draftSettings.themeMode === mode ? 'active' : ''}`}
                  onClick={() => updateDraft({ themeMode: mode })}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Accent color</p>
              <p className="setting-desc">Choose the primary color used across the UI</p>
            </div>
            <div className="color-control">
              <div className="color-swatches">
                {accentSwatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${draftSettings.accentColor.toLowerCase() === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateDraft({ accentColor: color })}
                    aria-label={`Set accent color to ${color}`}
                  />
                ))}
              </div>
              <input
                type="color"
                className="color-input"
                value={accentColorValue}
                onChange={(e) => updateDraft({ accentColor: e.target.value })}
                aria-label="Choose custom accent color"
              />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Layout density</p>
              <p className="setting-desc">Adjust spacing for compact or comfortable layouts</p>
            </div>
            <div className="segmented">
              {(['compact', 'comfortable'] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  className={`segmented-btn ${draftSettings.density === density ? 'active' : ''}`}
                  onClick={() => updateDraft({ density })}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Website Controls</h3>
          <p className="settings-section-desc">General website behavior and formatting</p>

          <div className="setting-row">
            <div>
              <p className="setting-title">Sidebar behavior</p>
              <p className="setting-desc">Choose how the navigation opens by default</p>
            </div>
            <select
              className="select-field"
              value={draftSettings.sidebarBehavior}
              onChange={(e) => updateDraft({ sidebarBehavior: e.target.value as SiteSettings['sidebarBehavior'] })}
            >
              <option value="expanded">Expanded</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Practice name</p>
              <p className="setting-desc">Your practice name appears in the sidebar header</p>
            </div>
            <input
              type="text"
              className="practice-name-input"
              value={draftSettings.practiceName}
              onChange={(e) => updateDraft({ practiceName: e.target.value })}
              placeholder="Enter your practice name"
              maxLength={30}
            />
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Language</p>
              <p className="setting-desc">Set the default language for the UI</p>
            </div>
            <select
              className="select-field"
              value={draftSettings.language}
              onChange={(e) => updateDraft({ language: e.target.value as SiteSettings['language'] })}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-row">
            <div>
              <p className="setting-title">Time format</p>
              <p className="setting-desc">Choose 12-hour or 24-hour time</p>
            </div>
            <div className="segmented">
              {(['12h', '24h'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`segmented-btn ${draftSettings.timeFormat === format ? 'active' : ''}`}
                  onClick={() => updateDraft({ timeFormat: format })}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section settings-preview">
          <h3>Preview</h3>
          <p className="settings-section-desc">See your choices applied instantly</p>
          <div className="preview-card">
            <div className="preview-header">
              <div>
                <p className="preview-title">Website Appearance</p>
                <p className="preview-subtitle">Live preview of your settings</p>
              </div>
              <span className="preview-pill">{resolvedTheme} mode</span>
            </div>
            <div className="preview-body">
              <div className="preview-row">
                <span>Language</span>
                <strong>{languageOption?.label || 'English'}</strong>
              </div>
              <div className="preview-row">
                <span>Time format</span>
                <strong>{previewTime}</strong>
              </div>
              <div className="preview-row">
                <span>Sidebar</span>
                <strong>{draftSettings.sidebarBehavior === 'collapsed' ? 'Collapsed' : 'Expanded'}</strong>
              </div>
            </div>
            <button className="btn btn-primary" type="button">
              Primary action
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
