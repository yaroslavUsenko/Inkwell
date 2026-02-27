import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState(location.state?.errorMessage ?? '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setResetUrl(data.resetUrl || '');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-card-title">Forgot password?</h1>
            <p className="auth-card-subtitle">We&apos;ll send a reset link to your email</p>
          </div>
        </div>

        <div className="auth-card-body">
          {sent ? (
            <div className="auth-sent-state">
              <div className="auth-sent-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <p className="auth-sent-text">{message}</p>
              {resetUrl && (
                <a href={resetUrl} className="btn auth-submit-btn" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                  Click here to reset password
                </a>
              )}
              <p className="auth-sent-hint">The link expires in 1 hour.</p>
              <Link to="/login" className="btn auth-submit-btn" style={{ marginTop: '1rem', textAlign: 'center' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && <p className="error">{error}</p>}
              <form onSubmit={handleSubmit} className="form">
                <div className="field">
                  <input
                    className="field-input"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label className="field-label" htmlFor="email">Email address</label>
                </div>

                <button type="submit" className="btn auth-submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </form>

              <div className="auth-footer">
                <span>Remember your password?</span>
                <Link to="/login" className="auth-footer-link">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
