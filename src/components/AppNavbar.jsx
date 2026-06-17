import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === 'caregiver' ? '/caregiver' : '/admin';

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          MamaCare
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav me-auto">
            <NavLink className="nav-link" to="/about">
              About
            </NavLink>
            {user && (
              <NavLink className="nav-link" to={dashboardPath}>
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="d-flex gap-2 align-items-center">
            {user ? (
              <>
                <span className="small text-muted">{user.full_name}</span>
                <button className="btn btn-outline-primary btn-sm" onClick={signOut}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
