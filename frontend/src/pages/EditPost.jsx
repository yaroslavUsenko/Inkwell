import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', body: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then(({ data }) => {
        if (!user || user.id !== data.author._id) {
          navigate(`/posts/${id}`);
          return;
        }
        setForm({ title: data.title, body: data.body });
      })
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/posts/${id}`, form);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
      setSaving(false);
    }
  };

  if (loading) return <p className="center">Loading...</p>;

  return (
    <div className="container">
      <div className="form-card">
        <div className="form-card-header">
          <div className="form-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="form-card-title">Edit Post</h1>
            <p className="form-card-subtitle">Update your post content</p>
          </div>
        </div>

        <div className="form-card-body">
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <input
                className="field-input"
                type="text"
                name="title"
                id="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder=" "
              />
              <label className="field-label" htmlFor="title">Title</label>
            </div>

            <div className="field">
              <textarea
                className="field-input field-textarea"
                name="body"
                id="body"
                value={form.body}
                onChange={handleChange}
                rows={10}
                required
                placeholder=" "
              />
              <label className="field-label" htmlFor="body">Content</label>
            </div>

            <div className="form-card-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
