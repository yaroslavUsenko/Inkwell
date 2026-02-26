import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#e53935','#8e24aa','#1e88e5','#00897b','#f4511e','#6d4c41','#039be5'];

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    name: '', bio: '', avatar: '',
    firstname: '', lastname: '', age: '', gender: '', address: '', website: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  const isOwn = user && user.id === id;

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then(({ data }) => {
        setProfile(data.user);
        setPosts(data.posts);
        setForm({
          name: data.user.name || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || '',
          firstname: data.user.firstname || '',
          lastname: data.user.lastname || '',
          age: data.user.age || '',
          gender: data.user.gender || '',
          address: data.user.address || '',
          website: data.user.website || '',
        });
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirm) return setPwError('Passwords do not match');
    setPwSaving(true);
    try {
      const { data } = await api.put(`/users/${id}/password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setShowPwForm(false);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${id}`, form);
      if (isOwn) updateUser({ ...user, name: data.name, bio: data.bio, avatar: data.avatar });
      navigate('/', { state: { successMessage: 'Profile updated successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
      setSaving(false);
    }
  };

  if (loading) return <p className="center">Loading...</p>;
  if (error && !profile) return <p className="center error">{error}</p>;
  if (!profile) return null;

  const colorIndex = profile.name.charCodeAt(0) % COLORS.length;
  const accentColor = COLORS[colorIndex];

  return (
    <div className="container">

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-card-banner" style={{ background: accentColor }} />
        <div className="profile-card-body">
          <div className="profile-card-avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="profile-card-avatar-img" />
            ) : (
              <div className="profile-card-avatar" style={{ background: accentColor }}>
                {profile.name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-card-info">
            <h1 className="profile-card-name">
              {profile.firstname || profile.lastname
                ? `${profile.firstname || ''} ${profile.lastname || ''}`.trim()
                : profile.name}
            </h1>
            <div className="profile-card-fields">
              {profile.email && (
                <span className="profile-field-item">
                  <span className="profile-field-label">Email:</span> {profile.email}
                </span>
              )}
              {profile.age && (
                <span className="profile-field-item">
                  <span className="profile-field-label">Age:</span> {profile.age}
                </span>
              )}
              {profile.gender && (
                <span className="profile-field-item">
                  <span className="profile-field-label">Gender:</span> {profile.gender}
                </span>
              )}
              {profile.address && (
                <span className="profile-field-item">
                  <span className="profile-field-label">Address:</span> {profile.address}
                </span>
              )}
              {profile.website && (
                <span className="profile-field-item">
                  <span className="profile-field-label">Website:</span>{' '}
                  <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a>
                </span>
              )}
              {!profile.firstname && !profile.age && !profile.gender && !profile.address && !profile.website && (
                <p className="profile-card-bio">No details yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Your Profile Form */}
      {isOwn && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>Your Profile</h2>
          <form onSubmit={handleSave} className="form">
            {error && <p className="error">{error}</p>}

            <label>Email
              <input type="email" value={profile.email} readOnly className="field-input" style={{ cursor: 'default', background: 'rgba(255,255,255,0.04)' }} />
            </label>

            <label>First Name
              <input type="text" name="firstname" value={form.firstname} onChange={handleChange} />
            </label>

            <label>Last Name
              <input type="text" name="lastname" value={form.lastname} onChange={handleChange} />
            </label>

            <label>Age
              <input type="text" name="age" value={form.age} onChange={handleChange} />
            </label>

            <label>Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label>Address
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </label>

            <label>Website
              <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
            </label>

            <div className="form-row">
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => { setShowPwForm(v => !v); setPwError(''); setPwSuccess(''); }}
              >
                {showPwForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password */}
      {showPwForm && isOwn && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div className="pw-form-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h2>Change Password</h2>
          </div>
          {pwError && <p className="error">{pwError}</p>}
          {pwSuccess && <p className="success">{pwSuccess}</p>}
          <form onSubmit={handlePwSave} className="form" style={{ marginTop: '1rem' }}>
            <div className="field">
              <input className="field-input" type="password" name="currentPassword" id="currentPassword"
                value={pwForm.currentPassword} onChange={handlePwChange} required placeholder=" " />
              <label className="field-label" htmlFor="currentPassword">Current Password</label>
            </div>
            <div className="field">
              <input className="field-input" type="password" name="newPassword" id="newPassword"
                value={pwForm.newPassword} onChange={handlePwChange} minLength={6} required placeholder=" " />
              <label className="field-label" htmlFor="newPassword">New Password (min 6 chars)</label>
            </div>
            <div className="field">
              <input
                className={`field-input${pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm ? ' field-input-error' : pwForm.confirm.length > 0 && pwForm.newPassword === pwForm.confirm ? ' field-input-ok' : ''}`}
                type="password" name="confirm" id="confirmPw"
                value={pwForm.confirm} onChange={handlePwChange} required placeholder=" " />
              <label className="field-label" htmlFor="confirmPw">Confirm New Password</label>
              {pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm && (
                <span className="field-hint-error">Passwords do not match</span>
              )}
              {pwForm.confirm.length > 0 && pwForm.newPassword === pwForm.confirm && (
                <span className="field-hint-ok">Passwords match</span>
              )}
            </div>
            <div className="form-row" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-sm" disabled={pwSaving || (pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm)}>
                {pwSaving ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 className="profile-posts-title">Posts by {profile.name}</h2>
        {posts.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No posts yet.</p>
        ) : (
          <div className="profile-posts-grid">
            {posts.map((p) => (
              <Link key={p._id} to={`/posts/${p._id}`} className="profile-post-chip">
                <span className="profile-post-chip-title">{p.title}</span>
                <span className="profile-post-chip-date">
                  {new Date(p.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
