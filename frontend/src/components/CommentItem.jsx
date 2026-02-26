import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#e53935','#8e24aa','#1e88e5','#00897b','#f4511e','#6d4c41','#039be5'];

export default function CommentItem({ comment, onDelete }) {
  const { user } = useAuth();
  const date = new Date(comment.createdAt).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const isAuthor = user && user.id === comment.author._id;
  const colorIndex = comment.author.name.charCodeAt(0) % COLORS.length;

  return (
    <div className="comment">
      <div className="comment-meta">
        <div
          className="comment-avatar"
          style={{ background: COLORS[colorIndex] }}
        >
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="comment-author-info">
          <Link to={`/profile/${comment.author._id}`} className="comment-author-name">
            {comment.author.name}
          </Link>
          <span className="comment-date">{date}</span>
        </div>
        {isAuthor && (
          <button
            className="comment-delete-btn"
            onClick={() => onDelete(comment._id)}
            title="Delete comment"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>
      <p className="comment-body">{comment.body}</p>
    </div>
  );
}
