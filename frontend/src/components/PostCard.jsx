import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const excerpt = post.description || (post.body.length > 120 ? post.body.slice(0, 120) + '…' : post.body);
  const date = new Date(post.createdAt).toLocaleDateString('uk-UA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const initial = post.author.name.charAt(0).toUpperCase();

  const colors = ['#e53935','#8e24aa','#1e88e5','#00897b','#f4511e','#6d4c41','#039be5'];
  const colorIndex = post.author.name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <article className="card">
      <div className="card-header">
        <div className="card-avatar" style={{ background: avatarColor }}>
          {initial}
        </div>
        <div className="card-author-info">
          <Link to={`/profile/${post.author._id}`} className="card-author-name">
            {post.author.name}
          </Link>
          <span className="card-date">{date}</span>
        </div>
      </div>

      <div className="card-body">
        <h2 className="card-title">
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </h2>
        <p className="card-excerpt">{excerpt}</p>
      </div>

      <div className="card-footer">
        <Link to={`/posts/${post._id}`} className="card-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Читати
        </Link>
        <button className="card-action-btn" onClick={() => navigator.share?.({ title: post.title, url: window.location.origin + '/posts/' + post._id })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Поділитись
        </button>
      </div>
    </article>
  );
}
