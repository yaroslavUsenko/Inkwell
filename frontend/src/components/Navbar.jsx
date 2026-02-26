import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Inkwell
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link
                to="/posts/create"
                className={`navbar-btn-new${location.pathname === '/posts/create' ? ' active' : ''}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add New Post
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className={`navbar-avatar-link${location.pathname === `/profile/${user.id}` ? ' active' : ''}`}
                title={user.name}
              >
                <span className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="navbar-username">My Profile</span>
              </Link>
              <button onClick={handleLogout} className="navbar-link navbar-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-btn-new">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
