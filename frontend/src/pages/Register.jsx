import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ username: false, email: false, password: false, confirm: false });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const usernameError = touched.username && !form.username
    ? 'The username is required and cannot be empty'
    : '';

  const emailError = touched.email
    ? (!form.email
        ? 'The email is required and cannot be empty'
        : !isValidEmail(form.email)
          ? 'The email address is not valid'
          : '')
    : '';

  const confirmError = touched.confirm
    ? (!form.confirm
        ? 'The confirm password is required and cannot be empty'
        : form.password !== form.confirm
          ? 'The password and its confirm are not the same'
          : '')
    : '';

  const isDisabled =
    loading ||
    !form.username ||
    !form.email ||
    !isValidEmail(form.email) ||
    !form.password ||
    !form.confirm ||
    form.password !== form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/', { state: { successMessage: 'Congrats! Your registration has been successful.' } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-card-title">Create account</h1>
            <p className="auth-card-subtitle">Join Inkwell and start writing</p>
          </div>
        </div>

        <div className="auth-card-body">
          {apiError && <p className="error">{apiError}</p>}
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
                type="text"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
              />
              <label className="field-label" htmlFor="email">Email</label>
              {emailError && <span className="field-hint-error">{emailError}</span>}
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
            </div>
            <div className="field">
              <input
                className="field-input"
                type="password"
                name="confirm"
                id="confirm"
                value={form.confirm}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=" "
              />
              <label className="field-label" htmlFor="confirm">Confirm Password</label>
              {confirmError && <span className="field-hint-error">{confirmError}</span>}
            </div>

            <button type="submit" className="btn auth-submit-btn" disabled={isDisabled}>
              {loading ? 'Creating account...' : 'Register Now'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
