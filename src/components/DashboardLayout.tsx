import { useState, useLayoutEffect, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    const [hydrated, setHydrated] = useState(false);

    useLayoutEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <div className={`dashboard-layout${!hydrated ? ' not-hydrated' : ''}`}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`main-content${collapsed ? ' expanded' : ''}`}>
                <div className="mobile-menu-toggle" style={{ left: collapsed ? '20px' : '300px' }}>
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
