import { useState, useLayoutEffect, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getSiteSettings } from '../utils/store';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved !== null) return JSON.parse(saved);
        } catch {
        }
        const settings = getSiteSettings();
        return settings.sidebarBehavior === 'collapsed';
    });

    const [hydrated, setHydrated] = useState(false);

    useLayoutEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    useEffect(() => {
        function handleSettingsUpdated() {
            const settings = getSiteSettings();
            if (settings.sidebarBehavior === 'collapsed') setCollapsed(true);
            if (settings.sidebarBehavior === 'expanded') setCollapsed(false);
        }

        window.addEventListener('site-settings-updated', handleSettingsUpdated);
        return () => window.removeEventListener('site-settings-updated', handleSettingsUpdated);
    }, []);

    return (
        <div className={`dashboard-layout${!hydrated ? ' not-hydrated' : ''}`}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`main-content${collapsed ? ' expanded' : ''}`}>
                <div className={`mobile-menu-toggle ${collapsed ? 'is-collapsed' : ''}`}>
                    <button
                        className={`hamburger-menu ${collapsed ? 'is-collapsed' : ''}`}
                        onClick={() => setCollapsed((c) => !c)}
                        aria-expanded={collapsed}
                        title={collapsed ? 'Open sidebar' : 'Close sidebar'}
                    >
                            <span></span>
                            <span></span>
                            <span></span>
                    </button>
                </div>

                <Outlet />
            </main>
        </div>
    );
}
