import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/immunitracklogo.png';
import { useState, useRef, useEffect } from 'react';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === 'caregiver' ? '/caregiver' : '/admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const signOut = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar bg-white border-bottom sticky-top" style={{ zIndex: 1060 }}>
      <div className="container position-relative py-1 d-flex justify-content-between align-items-center">
        
        <div ref={menuRef} className="position-relative">
          {/* Logo acts as the dropdown trigger */}
          <div 
            className="d-flex align-items-center gap-2 m-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="Menu"
          >
            <img
              src={logoImage}
              alt="ImmuniTrack Logo"
              className="navbar-logo"
            />
            <div className="brand-text">
              <span className="brand-title">ImmuniTrack</span>
              <small className="brand-subtitle">
                Immunisation Tracker
              </small>
            </div>
            {/* Small caret to indicate it's a menu */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              className={`ms-1 transition-transform ${isMenuOpen ? 'transform-rotate-180' : ''}`}
              viewBox="0 0 16 16"
              style={{ transition: 'transform 0.2s', transform: isMenuOpen ? 'rotate(180deg)' : 'none', color: '#0f8df5' }}
            >
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </div>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div 
              className="dropdown-menu shadow show"
              style={{ 
                position: 'absolute', 
                top: '100%', 
                left: '0', 
                marginTop: '12px', 
                minWidth: '220px', 
                zIndex: 1070,
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
                padding: '0.5rem 0'
              }}
            >
              <Link className="dropdown-item py-2 px-3 fw-medium" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link className="dropdown-item py-2 px-3 fw-medium" to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
              
              {user && (
                <Link className="dropdown-item py-2 px-3 fw-medium" to={dashboardPath} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              )}
              
              <div className="dropdown-divider my-2"></div>
              
              {user ? (
                <>
                  <div className="px-3 py-2 mb-1">
                    <small className="text-muted d-block">Signed in as</small>
                    <strong className="d-block text-truncate">{user.full_name}</strong>
                  </div>
                  <button className="dropdown-item py-2 px-3 text-danger fw-medium w-100 text-start border-0 bg-transparent" onClick={signOut}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="dropdown-item py-2 px-3 fw-medium" to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link className="dropdown-item py-2 px-3 fw-medium" to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default AppNavbar;
