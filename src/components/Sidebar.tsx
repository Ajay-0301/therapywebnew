import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { getUserData, saveUserData, type UserData } from '../utils/store';
import '../styles/layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM2 14a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg> },
  { path: '/clients', label: 'Clients', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg> },
  { path: '/insights', label: 'Insights', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg> },
  { path: '/settings', label: 'Settings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg> },
];

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: Dispatch<SetStateAction<boolean>> }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(() => getUserData());
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(() => userData?.name || 'Demo User');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftName(userData?.name || 'Demo User');
  }, [userData?.name]);

  const displayNameForInitials = editing ? draftName : (userData?.name || draftName || 'Demo User');

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'userData') setUserData(getUserData());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function onAvatarClick() {
    fileInputRef.current?.click();
  }

  async function resizeImageToDataUrl(file: File, maxSize = 512, quality = 0.8): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height *= maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width *= maxSize / height));
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas unsupported'));
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Invalid image'));
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const resized = await resizeImageToDataUrl(f, 512, 0.8);
      const newData: UserData = { ...(userData || { name: 'Demo User', email: '' }), avatar: resized, name: userData?.name || 'Demo User', email: userData?.email || '' };
      saveUserData(newData);
      setUserData(newData);
    } catch (err) {
      // keep console error for debugging
      // eslint-disable-next-line no-console
      console.error('Avatar upload failed', err);
    }
  }

  function removeAvatar() {
    if (!userData) return;
    const newData = { ...userData } as any;
    delete newData.avatar;
    saveUserData(newData);
    setUserData(newData);
  }

  function handleSaveName() {
    const newData: UserData = { ...(userData || { name: 'Demo User', email: '' }), name: draftName, email: userData?.email || '' };
    saveUserData(newData);
    setUserData(newData);
    setEditing(false);
  }

  function handleLogout() {
    localStorage.removeItem('userData');
    setUserData(null);
    navigate('/');
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3C9.372 3 4 8.372 4 15c0 4.418 2.389 8.277 5.935 10.348.39.228.665.602.665 1.052v2.6h10.8v-2.6c0-.45.275-.824.665-1.052C25.611 23.277 28 19.418 28 15c0-6.628-5.372-12-12-12z" fill="url(#grad)" /><circle cx="16" cy="14" r="3" fill="white" opacity="0.9" /><path d="M12 18c0-2.209 1.791-4 4-4s4 1.791 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" /><defs><linearGradient id="grad" x1="4" y1="3" x2="28" y2="29"><stop offset="0%" stopColor="#667eea"/><stop offset="100%" stopColor="#764ba2"/></linearGradient></defs></svg>
          <h1>TherapyNotes</h1>
        </div>
        <button className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`} onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Open sidebar' : 'Close sidebar'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar" style={{ position: 'relative' }}>
          {userData?.avatar ? (
            <img src={userData.avatar} alt="avatar" />
          ) : (
            <div className="avatar-initials">{displayNameForInitials.split(' ').map(s => s[0] || '').slice(0,2).join('').toUpperCase()}</div>
          )}

          {editing ? (
            <div className="avatar-action-container">
              <button className="avatar-action-btn avatar-action-save" title="Save" onClick={handleSaveName} aria-label="Save name">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button className="avatar-action-btn avatar-action-cancel" title="Cancel" onClick={() => { setDraftName(userData?.name || 'Demo User'); setEditing(false); }} aria-label="Cancel edit">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 6l12 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 6L6 18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button className="avatar-action-btn avatar-action-edit" title="Focus name" onClick={() => inputRef.current?.focus()} aria-label="Edit name">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 21h3l10.5-10.5-3-3L3 18v3z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <button className="avatar-upload-btn" title="Upload avatar" aria-label="Upload avatar" onClick={onAvatarClick}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 16V6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10l4-4 4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20H4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {userData?.avatar && (
                <button className="avatar-remove-btn" title="Remove avatar" aria-label="Remove avatar" onClick={removeAvatar}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 6l12 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 6L6 18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

          <div className="user-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {editing ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input ref={inputRef} className="user-name-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                  <button className="name-upload-btn" title="Upload avatar" onClick={() => fileInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 5v14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12h14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="save-btn" title="Save" onClick={handleSaveName}>✓</button>
                  <button className="cancel-btn" title="Cancel" onClick={() => { setDraftName(userData?.name || 'Demo User'); setEditing(false); }}>✕</button>
                </div>
              ) : (
                <h3 style={{ margin: 0 }}>{userData?.name || 'Demo User'}</h3>
              )}

              <button className="edit-btn" title="Edit name" onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21h3l10.5-10.5-3-3L3 18v3z" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 6.5l3 3" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

            </div>
            <p>Therapist</p>
          </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
        <span>Logout</span>
      </button>
    </aside>
  );
}
