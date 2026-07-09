import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import logoImage from '../assets/immunitracklogo.png';

const caregiverLinks = [
  ['/caregiver', 'Dashboard'],
  ['/caregiver/children', 'My Children'],
  ['/caregiver/upcoming', 'Upcoming'],
  ['/caregiver/missed', 'Missed'],
  ['/caregiver/reminders', 'Reminders'],
  ['/caregiver/profile', 'Profile']
];

const adminLinks = [
  ['/admin', 'Dashboard'],
  ['/admin/users', 'Caregivers'],
  ['/admin/children', 'Children'],
  ['/admin/schedule', 'Schedule'],
  ['/admin/due-this-week', 'Due This Week'],
  ['/admin/missed-cases', 'Missed Cases'],
  ['/admin/reports', 'Reports'],
  ['/admin/vaccine-stock', 'Vaccine Stock']
];

const DashboardLayout = () => {
  const { user } = useAuth();
  const links = user?.role === 'caregiver' ? caregiverLinks : adminLinks;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    <main className="dashboard-shell with-side-bg">
      <div className="container-fluid pt-3 pb-4 px-4 position-relative z-1">
        <div className="row g-4">
          {/* Navigation Sidebar */}
          <aside className="col-lg-3 col-xl-2">
            <div 
              className="dashboard-nav position-relative" 
              ref={menuRef} 
              style={{ overflow: 'visible' }} 
            >
              <div 
                className="dashboard-brand text-center mb-4 p-4 border rounded shadow-sm glass-panel"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s' }}
                title="Click to open menu"
              >
                <img
                  src={logoImage}
                  alt="ImmuniTrack"
                  className="dashboard-logo mb-2"
                />
                <h4 className="mt-2 text-primary d-flex align-items-center justify-content-center gap-2">
                  ImmuniTrack
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    fill="currentColor" 
                    className={`transition-transform ${isMenuOpen ? 'transform-rotate-180' : ''}`}
                    viewBox="0 0 16 16"
                    style={{ transition: 'transform 0.2s', transform: isMenuOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </h4>
                <p className="text-muted small m-0">
                  Vaccination Care System
                </p>
              </div>

              {isMenuOpen && (
                <div 
                  className="list-group shadow position-absolute w-100"
                  style={{ top: '100%', left: 0, zIndex: 1050, marginTop: '-12px', borderRadius: '8px' }}
                >
                  {links.map(([to, label]) => (
                    <NavLink
                      key={to}
                      end
                      className="list-group-item list-group-item-action py-3 fw-medium"
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <section className="col-lg-9 col-xl-10 col-md-12 d-flex flex-column gap-3">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;