import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentItem from '../components/CommentItem';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState(user?.name || '');
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/posts/${id}`), api.get(`/posts/${id}/comments`)])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data);
        setComments(commentsRes.data);
      })
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${id}`);
    navigate('/');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    try {
      await api.post(`/posts/${id}/comments`, { body: commentBody });
      navigate('/', { state: { successMessage: 'Comment added to the Post successfully!' } });
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    await api.delete(`/posts/${id}/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;
  if (!post) return null;

  const isAuthor = user && user.id === post.author._id;
  const date = new Date(post.createdAt).toLocaleDateString();

  return (
    <div className="container">
      <article className="post-full">
        <h1>{post.title}</h1>
        <p className="post-meta">
          By <Link to={`/profile/${post.author._id}`}>{post.author.name}</Link> · {date}
        </p>

        {isAuthor && (
          <div className="post-actions">
            <Link to={`/posts/${id}/edit`} className="btn btn-sm">Edit</Link>
            <button onClick={handleDelete} className="btn btn-sm danger">Delete</button>
          </div>
        )}

        <div className="post-body">{post.body}</div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} onDelete={handleDeleteComment} />
        ))}

        {user ? (
          <div className="comment-form-wrap">
            <form onSubmit={handleAddComment} className="form comment-form">
              {commentError && <p className="error">{commentError}</p>}
              <input
                type="text"
                name="name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your name"
                required
              />
              <textarea
                name="message"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write your comment..."
                rows={4}
                required
              />
              <div className="comment-form-actions">
                <button type="submit" className="btn btn-sm">Add Comment</button>
              </div>
            </form>
          </div>
        ) : (
          <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
            <Link to="/login">Login</Link> to leave a comment.
          </p>
        )}
      </section>
    </div>
  );
}
