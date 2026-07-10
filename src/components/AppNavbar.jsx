import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/immunitracklogo.png';
import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const AppNavbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === 'caregiver' ? '/caregiver' : '/admin';
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const notifRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

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
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = reminders.filter(r => r.status === 'unread').length;

  const handleReminderClick = async (rem) => {
    if (rem.status === 'unread') {
      try {
        await api.put(`/reminders/${rem.id}/read`);
        setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, status: 'read' } : r));
      } catch (err) {
        console.error(err);
      }
    }
    setIsNotifOpen(false);
    navigate(user?.role === 'caregiver' ? '/caregiver/reminders' : '/admin/reports');
  };

  const markAllRead = async () => {
    try {
      const unreadReminders = reminders.filter(r => r.status === 'unread');
      await Promise.all(unreadReminders.map(r => api.put(`/reminders/${r.id}/read`)));
      setReminders(prev => prev.map(r => ({ ...r, status: 'read' })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar bg-white border-bottom sticky-top" style={{ zIndex: 1060 }}>
      <div className="container py-1 d-flex justify-content-between align-items-center gap-3">

        {/* Left: Logo + Nav Links */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none m-0">
            <img src={logoImage} alt="ImmuniTrack Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">ImmuniTrack</span>
              <small className="brand-subtitle">Immunisation Tracker</small>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-3">
            <Link className="nav-link fw-medium text-dark" to="/">Home</Link>
            <Link className="nav-link fw-medium text-dark" to="/about">About</Link>
            {user && <Link className="nav-link fw-medium text-dark" to={dashboardPath}>Dashboard</Link>}
          </div>
        </div>

        {/* Right: Theme Toggle + Auth Links + Notification Bell */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary px-2"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ fontSize: '1.1rem', lineHeight: 1 }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user && !loading && (
            <>
              <span className="text-muted small d-none d-md-inline">Hi, {user.full_name?.split(' ')[0]}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={signOut}>Logout</button>

              {/* Notification Bell */}
              <div className="position-relative" ref={notifRef}>
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

                {isNotifOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end shadow show"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
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
                        <button className="btn btn-link p-0 text-decoration-none text-muted" onClick={markAllRead} style={{ fontSize: '0.75rem' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="py-1">
                      {reminders.length === 0 ? (
                        <div className="px-3 py-4 text-center text-muted small">No new notifications</div>
                      ) : (
                        reminders.map(rem => (
                          <div
                            key={rem.id}
                            className={`px-3 py-2 border-bottom hover-bg-light transition-colors ${rem.status === 'read' ? 'opacity-50' : ''}`}
                            style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                            onClick={() => handleReminderClick(rem)}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <span>{rem.message}</span>
                              {rem.status === 'unread' && (
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
            </>
          )}

          {!user && !loading && (
            <>
              <Link className="btn btn-sm btn-outline-primary" to="/login">Login</Link>
              <Link className="btn btn-sm btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default AppNavbar;
