import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import Toast from '../components/Toast';

export default function Home() {
  const location = useLocation();
  const [successMessage] = useState(location.state?.successMessage ?? '');

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts?page=${page}&limit=9`)
      .then(({ data }) => {
        setPosts(data.posts);
        setPages(data.pages);
      })
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;

  return (
    <div className="container">
      {successMessage && <Toast message={successMessage} />}
      <h1>All Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to write one!</p>
      ) : (
        <div className="cards-grid">
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            &laquo; Prev
          </button>
          <span>Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
