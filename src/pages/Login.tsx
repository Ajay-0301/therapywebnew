import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserData } from '../utils/store';
import '../styles/login.css';

// Feature lists configuration
const LOGIN_FEATURES = [
    'Secure & Confidential',
    'Real-time Insights',
    'Professional Tools'
];

const REGISTER_FEATURES = [
    'Easy Registration',
    'Start Immediately',
    '24/7 Support'
];

// Demo account configuration
const DEMO_ACCOUNT = {
    email: 'demo@therapy.com',
    password: 'Demo@12345'
};

// Validation configuration
const MIN_PASSWORD_LENGTH = 8;

export default function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPass, setShowLoginPass] = useState(false);

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regId, setRegId] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [showRegPass, setShowRegPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [error, setError] = useState('');

    const getPasswordStrength = (password: string) => {
        if (!password) return '';
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    };

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!loginEmail || !loginPassword) {
            setError('Please fill in all fields');
            return;
        }

        // Demo login or any login
        const userData = { email: loginEmail, name: loginEmail.split('@')[0], registeredAt: new Date().toISOString() };
        saveUserData(userData);
        navigate('/dashboard');
    };

    const handleRegister = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!regName || !regEmail || !regId || !regPassword || !regConfirm) {
            setError('Please fill in all fields');
            return;
        }
        if (regPassword.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }
        if (regPassword !== regConfirm) {
            setError('Passwords do not match');
            return;
        }

        const userData = { email: regEmail, name: regName, id: regId, registeredAt: new Date().toISOString() };
        saveUserData(userData);
        navigate('/dashboard');
    };

    const strength = getPasswordStrength(regPassword);

    return (
        <div className="auth-page">
            {isLogin ? (
                <div className="container login-container">
                    <div className="left-section">
                        <div className="branding">
                            <h1 className="auth-logo">Therapy Notes</h1>
                            <p className="tagline">Professional Mental Health Management</p>
                            <div className="features">
                                {LOGIN_FEATURES.map((feature, idx) => (
                                    <div key={idx} className="feature-item"><span className="feature-icon">✓</span><span>{feature}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="right-section">
                        <div className="form-wrapper">
                            <h2>Welcome Back</h2>
                            <p className="form-subtitle">Sign in to your account</p>

                            {error && <p className="error-msg">{error}</p>}

                            <form onSubmit={handleLogin} className="auth-form">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="password-wrapper">
                                        <input type={showLoginPass ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" required />
                                        <button type="button" className="toggle-password" onClick={() => setShowLoginPass(!showLoginPass)} title={showLoginPass ? 'Hide password' : 'Show password'}>
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {showLoginPass ? (
                                              <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                              </>
                                            ) : (
                                              <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                              </>
                                            )}
                                          </svg>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
                            </form>

                            <div className="auth-divider"><span>New to Therapy Notes?</span></div>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setIsLogin(false); setError(''); }}>Create an Account</button>

                            <div className="demo-section">
                                <p className="demo-title">Demo Account</p>
                                <p className="demo-text">Email: <strong>{DEMO_ACCOUNT.email}</strong></p>
                                <p className="demo-text">Password: <strong>{DEMO_ACCOUNT.password}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container register-container">
                    <div className="left-section">
                        <div className="branding">
                            <h1 className="auth-logo">Therapy Notes</h1>
                            <p className="tagline">Professional Mental Health Management</p>
                            <div className="features">
                                {REGISTER_FEATURES.map((feature, idx) => (
                                    <div key={idx} className="feature-item"><span className="feature-icon">✓</span><span>{feature}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="right-section">
                        <div className="form-wrapper">
                            <h2>Create Account</h2>
                            <p className="form-subtitle">Join Therapy Notes today</p>

                            {error && <p className="error-msg">{error}</p>}

                            <form onSubmit={handleRegister} className="auth-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Dr. Jane Doe" required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Professional ID</label>
                                    <input type="text" value={regId} onChange={(e) => setRegId(e.target.value)} placeholder="License/ID Number" required />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="password-wrapper">
                                        <input type={showRegPass ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Create a strong password" required />
                                        <button type="button" className="toggle-password" onClick={() => setShowRegPass(!showRegPass)} title={showRegPass ? 'Hide password' : 'Show password'}>
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {showRegPass ? (
                                              <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                              </>
                                            ) : (
                                              <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                              </>
                                            )}
                                          </svg>
                                        </button>
                                    </div>
                                    {regPassword && <div className={`password-strength ${strength}`}>{strength}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="password-wrapper">
                                        <input type={showConfirmPass ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="Confirm your password" required />
                                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPass(!showConfirmPass)} title={showConfirmPass ? 'Hide password' : 'Show password'}>
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {showConfirmPass ? (
                                              <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                              </>
                                            ) : (
                                              <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                              </>
                                            )}
                                          </svg>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
                            </form>

                            <div className="auth-divider"><span>Already have an account?</span></div>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setIsLogin(true); setError(''); }}>Sign In Instead</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
