import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  ['/admin/reports', 'Reports']
];

const DashboardLayout = () => {
  const { user } = useAuth();
  const links = user?.role === 'caregiver' ? caregiverLinks : adminLinks;

  return (
    <main className="dashboard-shell">
      <div className="container py-4">
        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="list-group dashboard-nav">
              {links.map(([to, label]) => (
                <NavLink key={to} end className="list-group-item list-group-item-action" to={to}>
                  {label}
                </NavLink>
              ))}
            </div>
          </aside>
          <section className="col-lg-9">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
