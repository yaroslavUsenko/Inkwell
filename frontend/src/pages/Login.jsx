import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [error, setError] = useState(location.state?.authError ?? '');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const usernameError = touched.username && !form.username
    ? 'The username is required and cannot be empty'
    : '';
  const passwordError = touched.password && !form.password
    ? 'The Password is required and cannot be empty'
    : '';

  const isDisabled = loading || !form.username || !form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Invalid username/password, Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-subtitle">Sign in to your Inkwell account</p>
          </div>
        </div>

        <div className="auth-card-body">
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <input
                className="field-input"
                type="text"
                name="username"
                id="username"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
              />
              <label className="field-label" htmlFor="username">Username</label>
              {usernameError && <span className="field-hint-error">{usernameError}</span>}
            </div>
            <div className="field">
              <input
                className="field-input"
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
              />
              <label className="field-label" htmlFor="password">Password</label>
              {passwordError && <span className="field-hint-error">{passwordError}</span>}
            </div>

            <button type="submit" className="btn auth-submit-btn" disabled={isDisabled}>
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-footer-link">Forgot password?</Link>
            <span className="auth-footer-sep">·</span>
            <span>No account? <Link to="/register" className="auth-footer-link">Register</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
