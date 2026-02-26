import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/auth/validate-reset-token/${token}`)
      .then(() => setChecking(false))
      .catch(() => {
        navigate('/forgot-password', {
          state: { errorMessage: 'Password reset token is invalid or has expired.' },
        });
      });
  }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: form.password });
      localStorage.setItem('token', data.token);
      updateUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm;
  const passwordsMismatch = form.confirm.length > 0 && form.password !== form.confirm;

  if (checking) return <p className="center">Verifying token…</p>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-card-title">Set new password</h1>
            <p className="auth-card-subtitle">Choose a strong password for your account</p>
          </div>
        </div>

        <div className="auth-card-body">
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <input
                className="field-input"
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
                placeholder=" "
              />
              <label className="field-label" htmlFor="password">New password (min 6 chars)</label>
            </div>

            <div className="field">
              <input
                className={`field-input${passwordsMismatch ? ' field-input-error' : passwordsMatch ? ' field-input-ok' : ''}`}
                type="password"
                name="confirm"
                id="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label className="field-label" htmlFor="confirm">Confirm new password</label>
              {passwordsMismatch && <span className="field-hint-error">Passwords do not match</span>}
              {passwordsMatch && <span className="field-hint-ok">Passwords match</span>}
            </div>

            <button type="submit" className="btn auth-submit-btn" disabled={loading || passwordsMismatch}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
