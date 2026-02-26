import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', body: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/posts', form);
      navigate('/', { state: { successMessage: 'Blog Post posted successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <div className="form-card-header">
          <div className="form-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="form-card-title">Add New Post</h1>
            <p className="form-card-subtitle">Share your thoughts with the world</p>
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
              <input
                className="field-input"
                type="text"
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                placeholder=" "
              />
              <label className="field-label" htmlFor="description">Description</label>
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
              <span className="form-card-hint">
                {form.body.length > 0 ? `${form.body.length} characters` : ''}
              </span>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  'Add Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
