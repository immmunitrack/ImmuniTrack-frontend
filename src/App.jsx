import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import CaregiverDashboard from './pages/CaregiverDashboard';
import MyChildren from './pages/MyChildren';
import AddChild from './pages/AddChild';
import ChildDetails from './pages/ChildDetails';
import ImmunisationTimeline from './pages/ImmunisationTimeline';
import UpcomingImmunisations from './pages/UpcomingImmunisations';
import MissedImmunisations from './pages/MissedImmunisations';
import MyReminders from './pages/MyReminders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageChildren from './pages/ManageChildren';
import ManageSchedule from './pages/ManageSchedule';
import DueThisWeek from './pages/DueThisWeek';
import MissedCases from './pages/MissedCases';
import Reports from './pages/Reports';
import VaccineStock from './pages/VaccineStock';
import NotFound from './pages/NotFound';

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, []);

  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute roles={['caregiver']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route path="/caregiver/children" element={<MyChildren />} />
            <Route path="/caregiver/upcoming" element={<UpcomingImmunisations />} />
            <Route path="/caregiver/missed" element={<MissedImmunisations />} />
            <Route path="/caregiver/reminders" element={<MyReminders />} />
            <Route path="/caregiver/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['caregiver', 'health_worker', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/caregiver/children/new" element={<AddChild />} />
            <Route path="/caregiver/children/:id" element={<ChildDetails />} />
            <Route path="/caregiver/children/:id/edit" element={<AddChild mode="edit" />} />
            <Route path="/caregiver/children/:id/timeline" element={<ImmunisationTimeline />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin', 'health_worker']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/children" element={<ManageChildren />} />
            <Route path="/admin/schedule" element={<ManageSchedule />} />
            <Route path="/admin/due-this-week" element={<DueThisWeek />} />
            <Route path="/admin/missed-cases" element={<MissedCases />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/vaccine-stock" element={<VaccineStock />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
