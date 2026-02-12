import { useLocation, useNavigate } from 'react-router-dom';
import { getUserData } from '../utils/store';
import '../styles/layout.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM2 14a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg> },
    { path: '/clients', label: 'Clients', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg> },
    { path: '/insights', label: 'Insights', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg> },
    { path: '/settings', label: 'Settings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg> },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getUserData();

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 3C9.372 3 4 8.372 4 15c0 4.418 2.389 8.277 5.935 10.348.39.228.665.602.665 1.052v2.6h10.8v-2.6c0-.45.275-.824.665-1.052C25.611 23.277 28 19.418 28 15c0-6.628-5.372-12-12-12z" fill="url(#grad)" />
                        <circle cx="16" cy="14" r="3" fill="white" opacity="0.9" />
                        <path d="M12 18c0-2.209 1.791-4 4-4s4 1.791 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                        <defs><linearGradient id="grad" x1="4" y1="3" x2="28" y2="29"><stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" /></linearGradient></defs>
                    </svg>
                    <h1>TherapyNotes</h1>
                </div>
            </div>

            <div className="user-info">
                <div className="user-avatar">👨‍⚕️</div>
                <div className="user-details">
                    <h3>{user?.name || 'Demo User'}</h3>
                    <p>Therapist</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
            </button>
        </aside>
    );
}
