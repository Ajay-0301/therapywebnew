import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSiteSettings } from './utils/store';
import { applySiteSettings } from './utils/sitePreferences';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import ClientProfile from './pages/ClientProfile';
import Insights from './pages/Insights';
import Settings from './pages/Settings';

// App routes

function App() {
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());

  useEffect(() => {
    applySiteSettings(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    function handleSettingsUpdated() {
      setSiteSettings(getSiteSettings());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === 'siteSettings') setSiteSettings(getSiteSettings());
    }

    window.addEventListener('site-settings-updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('site-settings-updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (siteSettings.themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applySiteSettings(getSiteSettings());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [siteSettings.themeMode]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/clients/:id" element={<ClientProfile />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
