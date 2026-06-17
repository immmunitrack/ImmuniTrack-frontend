import { Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import JobSeekerProfile from './pages/JobSeekerProfile';
import MyApplications from './pages/MyApplications';
import ApplyJob from './pages/ApplyJob';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerProfile from './pages/EmployerProfile';
import JobForm from './pages/JobForm';
import MyJobs from './pages/MyJobs';
import ViewApplicants from './pages/ViewApplicants';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageJobs from './pages/ManageJobs';
import ManageApplications from './pages/ManageApplications';
import NotFound from './pages/NotFound';

const App = () => (
  <>
    <AppNavbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<BrowseJobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={['job_seeker']} />}>
        <Route path="/jobs/:id/apply" element={<ApplyJob />} />
        <Route element={<DashboardLayout />}>
          <Route path="/job-seeker" element={<JobSeekerDashboard />} />
          <Route path="/job-seeker/profile" element={<JobSeekerProfile />} />
          <Route path="/job-seeker/applications" element={<MyApplications />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['employer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/jobs" element={<MyJobs />} />
          <Route path="/employer/jobs/new" element={<JobForm />} />
          <Route path="/employer/jobs/:id/edit" element={<JobForm mode="edit" />} />
          <Route path="/employer/jobs/:id/applicants" element={<ViewApplicants />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/jobs" element={<ManageJobs />} />
          <Route path="/admin/applications" element={<ManageApplications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
