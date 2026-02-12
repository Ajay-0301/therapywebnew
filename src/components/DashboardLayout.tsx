import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`main-content${collapsed ? ' expanded' : ''}`}>
                <div className="mobile-menu-toggle">
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
