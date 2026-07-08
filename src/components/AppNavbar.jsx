import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/immunitracklogo.png';
import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === 'caregiver' ? '/caregiver' : '/admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const fetchReminders = async () => {
    if (!user) return;
    try {
      const res = await api.get('/reminders/my-reminders');
      setReminders(res.data.reminders || []);
    } catch (err) {
      console.error('Could not fetch reminders', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
      const interval = setInterval(fetchReminders, 30000);
      return () => clearInterval(interval);
    } else {
      setReminders([]);
    }
  }, [user]);

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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = reminders.filter(r => !r.is_read).length;

  const handleReminderClick = async (rem) => {
    if (!rem.is_read) {
      try {
        await api.put(`/reminders/${rem.id}/read`);
        fetchReminders();
      } catch (err) {
        console.error(err);
      }
    }
    setIsNotifOpen(false);
    navigate(user?.role === 'caregiver' ? '/caregiver/reminders' : '/admin/reports');
  };

  const markAllRead = async () => {
    try {
      const unreadReminders = reminders.filter(r => !r.is_read);
      await Promise.all(unreadReminders.map(r => api.put(`/reminders/${r.id}/read`)));
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

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

        {/* Right side: Notification Bell */}
        {user && (
          <div className="d-flex align-items-center gap-3" ref={notifRef}>
            <div className="position-relative">
              <button 
                className="btn btn-link p-1 position-relative text-decoration-none border-0" 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ fontSize: '1.25rem', outline: 'none', boxShadow: 'none' }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                    style={{ fontSize: '0.55rem', padding: '0.25em 0.5em', transform: 'translate(-30%, -20%)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotifOpen && (
                <div 
                  className="dropdown-menu dropdown-menu-end shadow show"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: '0', 
                    left: 'auto',
                    marginTop: '12px', 
                    width: '320px', 
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1070,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    padding: '0.5rem 0'
                  }}
                >
                  <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                    <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
                    {unreadCount > 0 && (
                      <button 
                        className="btn btn-link p-0 text-decoration-none text-muted" 
                        onClick={markAllRead}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    {reminders.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted small">
                        No new notifications
                      </div>
                    ) : (
                      reminders.map(rem => (
                        <div 
                          key={rem.id} 
                          className={`px-3 py-2 border-bottom hover-bg-light transition-colors ${rem.is_read ? 'opacity-50' : ''}`}
                          style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => handleReminderClick(rem)}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <span>{rem.message}</span>
                            {!rem.is_read && (
                              <span className="badge rounded-circle bg-primary mt-1" style={{ width: '6px', height: '6px', padding: 0 }}></span>
                            )}
                          </div>
                          <small className="text-muted d-block mt-1">
                            {new Date(rem.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 text-center border-top">
                    <Link 
                      className="small text-primary text-decoration-none font-weight-medium" 
                      to={user?.role === 'caregiver' ? '/caregiver/reminders' : '/admin/reports'}
                      onClick={() => setIsNotifOpen(false)}
                    >
                      View all reminders
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default AppNavbar;
