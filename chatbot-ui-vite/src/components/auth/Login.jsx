import { useState, useEffect, useRef } from 'react';
import '../../styles/auth.css';
import { authAPI } from '../../api/authAPI';
import pragnaLogo from '../../assets/pragna-logo-full.png';

export default function Login({ onLoginSuccess }) {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Initialize Vanta.js animation
  useEffect(() => {
    // Load Vanta.js libraries
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.head.appendChild(script1);

    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
      document.head.appendChild(script2);

      script2.onload = () => {
        if (window.VANTA && vantaRef.current && !effectRef.current) {
          effectRef.current = window.VANTA.GLOBE({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xffd700,
            backgroundColor: 0x0a0a0a,
            size: 0.8,
            xyFrequency: 0.1,
            zFrequency: 0.05,
          });
        }
      };
    };

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);

      if (data.error) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user_id);
      const resolvedUsername = data.username || username;
      const resolvedEmail = data.email || localStorage.getItem('authEmail') || '';
      localStorage.setItem('authUsername', resolvedUsername);
      if (resolvedEmail) {
        localStorage.setItem('authEmail', resolvedEmail);
      }
      
      onLoginSuccess(data.user_id, data.token, {
        username: resolvedUsername,
        email: resolvedEmail,
      });
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.register(username, email, password);

      if (data.error) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user_id);
      const resolvedUsername = data.username || username;
      const resolvedEmail = data.email || email;
      localStorage.setItem('authUsername', resolvedUsername);
      if (resolvedEmail) {
        localStorage.setItem('authEmail', resolvedEmail);
      }
      
      onLoginSuccess(data.user_id, data.token, {
        username: resolvedUsername,
        email: resolvedEmail,
      });
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetLoading(true);
    try {
      await authAPI.forgotPassword(resetEmail);
      // Always show the same success state regardless of whether the email
      // is registered - the backend deliberately never reveals that.
      setResetSent(true);
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
    setError('');
  };

  return (
    <div className="auth-container">
      <div ref={vantaRef} className="vanta-canvas"></div>

      <div className="auth-header">
        <div className="header-logo-container">
          <img src={pragnaLogo} alt="Pragna" className="header-logo-small" />
          <h2 className="project-name">PRAGNA-1 A</h2>
        </div>
        <p className="company-subtitle">
          Powered by <span className="etherx-text">EtherX Innovations</span>
        </p>
      </div>

      <div className="auth-box">
        {showForgotPassword ? (
          <>
            <h1>Reset Password</h1>

            {error && <div className="auth-error">{error}</div>}

            {resetSent ? (
              <>
                <p style={{ color: 'var(--pragna-text-muted, #a89878)', fontSize: '14px', lineHeight: 1.6, margin: '4px 0 20px 0' }}>
                  If that email is registered, a password reset link has been sent. Check your inbox
                  (and spam folder) - the link expires in 60 minutes.
                </p>
                <button type="button" onClick={backToLogin} className="auth-btn">
                  Back to login
                </button>
              </>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ color: 'var(--pragna-text-muted, #a89878)', fontSize: '13.5px', lineHeight: 1.5, margin: '4px 0 16px 0' }}>
                  Enter your account email and we'll send you a link to reset your password.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetLoading}
                />
                <button type="submit" disabled={resetLoading} className="auth-btn">
                  {resetLoading ? '...' : 'Send reset link'}
                </button>
              </form>
            )}

            {!resetSent && (
              <p className="auth-toggle">
                <button type="button" onClick={backToLogin} disabled={resetLoading}>
                  Back to login
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <h1>{showRegister ? 'Create Account' : 'Welcome Back'}</h1>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={showRegister ? handleRegister : handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />

              {showRegister && (
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              )}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              {showRegister && (
                <p className="password-hint">Min 8 characters</p>
              )}

              {!showRegister && (
                <p className="auth-toggle" style={{ margin: '-8px 0 4px 0', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(''); }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </p>
              )}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? '...' : showRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <p className="auth-toggle">
              {showRegister ? 'Have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setShowRegister(!showRegister);
                  setError('');
                }}
                disabled={loading}
              >
                {showRegister ? ' Login' : ' Register'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
