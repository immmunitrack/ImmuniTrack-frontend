import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api, { formatDate } from '../services/api';
import heroImage from '../assets/immunitrack-hero.png';
import logoImage from '../assets/immunitracklogo.png';

const emptyChild = {
  full_name: '',
  date_of_birth: '',
  gender: 'Female',
  birth_place: '',
  district: '',
  subcounty: '',
  health_facility_id: '',
  immunisation_card_number: ''
};

const emptySchedule = {
  vaccine_name: '',
  description: '',
  recommended_age_label: '',
  due_offset_days: 0,
  dose_number: 1,
  is_required: true
};

const useApi = (path, key) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(path);
      setData(key ? res.data[key] || [] : res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [path]);

  return { data, loading, error, refresh: load };
};

const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatGrid = ({ stats }) => (
  <div className="stat-grid">
    {stats.map((item) => (
      <div className="stat-card" key={item.label}>
        <span>{item.label}</span>
        <strong>{item.value ?? 0}</strong>
      </div>
    ))}
  </div>
);

const SearchBox = ({ value, onChange, placeholder = 'Search' }) => (
  <input className="form-control" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
);

const EventTable = ({ events, onComplete, onMissed }) => (
  <div className="table-responsive app-card">
    <table className="table align-middle mb-0">
      <thead>
        <tr>
          <th>Child</th>
          <th>Vaccine / Visit</th>
          <th>Recommended Age</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Date Received</th>
          {(onComplete || onMissed) && <th />}
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>{event.child_name || 'Child'}</td>
            <td>
              <strong>{event.vaccine_name}</strong>
              {event.notes && <div className="small text-muted">{event.notes}</div>}
            </td>
            <td>{event.recommended_age_label}</td>
            <td>
              <span className="date-chip">{formatDate(event.due_date)}</span>
            </td>
            <td>
              <StatusBadge status={event.status} />
            </td>
            <td>{formatDate(event.date_received)}</td>
            {(onComplete || onMissed) && (
              <td className="text-end">
                {event.status !== 'completed' && onComplete && (
                  <button className="btn btn-sm btn-success me-2" onClick={() => onComplete(event)}>
                    Complete
                  </button>
                )}
                {event.status !== 'completed' && onMissed && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onMissed(event)}>
                    Missed
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
        {!events.length && (
          <tr>
            <td colSpan="7" className="text-center text-muted py-4">
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ChildCard = ({ child }) => (
  <div className="app-card child-card">
    <div>
      <h3>{child.full_name}</h3>
      <p>{child.gender} · Born {formatDate(child.date_of_birth)}</p>
      <p className="mb-0">{child.district}{child.subcounty ? `, ${child.subcounty}` : ''}</p>
    </div>
    <div className="d-flex flex-wrap gap-2">
      <Link className="btn btn-sm btn-outline-primary" to={`/caregiver/children/${child.id}`}>
        Details
      </Link>
      <Link className="btn btn-sm btn-primary" to={`/caregiver/children/${child.id}/timeline`}>
        Timeline
      </Link>
    </div>
  </div>
);

export const Home = () => (
  <main>
    <section className="hero-section">
      <img src={heroImage} alt="" className="hero-image" />
      <div className="hero-overlay" />
      <div className="container hero-content">
        <div>
          <span className="eyebrow">No Child Should miss a vaccine because the system lost track of them.</span>
          <h1>ImmuniTrack</h1>
          <p>
            Track every child’s vaccine visits, see what is due next, and keep reminders close for every caregiver and
            health worker.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-lg" to="/register">
              Register as Caregiver
            </Link>
            <Link className="btn btn-light btn-lg" to="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
    <section className="container py-5">
      <div className="row g-4">
        {[
          ['Child timelines', 'DOB-based schedules calculate due dates from editable vaccine offsets.'],
          ['Reminder list', 'In-app reminders are generated 7 days before, 1 day before, and after missed visits.'],
          ['Health worker view', 'Admins can review missed cases, due children, schedules, and basic statistics.']
        ].map(([title, text]) => (
          <div className="col-md-4" key={title}>
            <div className="app-card h-100">
              <h2 className="h5">{title}</h2>
              <p className="text-muted mb-0">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </main>
);


export const About = () => (
  <main className="container py-5 narrow-page with-side-bg" style={{ minHeight: 'calc(100vh - 57px)', position: 'relative', zIndex: 1 }}>
    <div className="text-center mb-5">
      <h1 className="display-4 fw-bold text-primary">About ImmuniTrack</h1>
      <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
        Bridging the gap between caregivers and healthcare workers to ensure every child 
        receives their life-saving immunisations on time.
      </p>
    </div>

    <section className="mb-5">
      <h2 className="h4 mb-3 fw-semibold">Our Mission</h2>
      <p className="text-secondary" style={{ lineHeight: '1.7' }}>
        Protecting a child's health requires timely action, but keeping track of complex 
        vaccination schedules can be overwhelming. ImmuniTrack is a digital health companion 
        designed to simplify immunisation tracking, reduce missed clinic visits, and ensure 
        no child falls behind on their routine health milestones.
      </p>
    </section>

    <section className="mb-5">
      <h2 className="h4 mb-4 fw-semibold">Key Capabilities</h2>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm p-3 bg-light">
            <div className="card-body">
              <h3 className="h5 card-title text-dark fw-bold">For Caregivers &amp; Mothers</h3>
              <p className="card-text text-secondary small">
                Easily register your children, view personalized vaccine timelines from birth, 
                track upcoming appointments, and keep a reliable digital history of received immunisations.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm p-3 bg-light">
            <div className="card-body">
              <h3 className="h5 card-title text-dark fw-bold">For Health Workers &amp; Admins</h3>
              <p className="card-text text-secondary small">
                Maintain the central schedule database, review upcoming or missed facility visits at a glance, 
                manage child profiles efficiently, and access simple data insights to protect community health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="alert alert-warning d-flex align-items-start p-3 mt-4 border-0 shadow-sm" role="alert">
      <span className="me-2 fs-5" aria-hidden="true">⚠️</span>
      <div>
        <strong className="d-block mb-1">Important Health Disclaimer</strong>
        <span className="small text-dark">
          ImmuniTrack is an informational platform and reminder tool. It does not replace the professional advice, 
          clinical diagnosis, or direct medical treatment provided by a qualified health worker or pediatrician. 
          Always consult your local clinic regarding your child's specific medical needs.
        </span>
      </div>
    </div>
  </main>
);

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'caregiver' ? '/caregiver' : '/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Login</h1>
        <AlertMessage type="danger" message={error} />
        <label className="form-label">Email</label>
        <input className="form-control mb-3" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="form-label">Password</label>
        <input className="form-control mb-3" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-100">Login</button>
      </form>
    </main>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', preferred_reminder_method: 'in_app' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/caregiver');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create Caregiver Account</h1>
        <AlertMessage type="danger" message={error} />
        {['full_name', 'phone', 'email', 'password'].map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
            <input
              className="form-control"
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </div>
        ))}
        <label className="form-label">Preferred reminder method</label>
        <select className="form-select mb-3" value={form.preferred_reminder_method} onChange={(e) => setForm({ ...form, preferred_reminder_method: e.target.value })}>
          <option value="in_app">In-app</option>
          <option value="sms">SMS later</option>
          <option value="whatsapp">WhatsApp later</option>
        </select>
        <button className="btn btn-primary w-100">Register</button>
      </form>
    </main>
  );
};

export const CaregiverDashboard = () => {
  const { data: children, loading } = useApi('/children/my-children', 'children');
  const { data: upcoming } = useApi('/immunisations/upcoming', 'immunisations');
  const { data: missed } = useApi('/immunisations/missed', 'immunisations');
  const { data: reminders } = useApi('/reminders/my-reminders', 'reminders');

  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="Caregiver Dashboard" subtitle="A quick view of your children, reminders, and next visits." action={<Link className="btn btn-primary" to="/caregiver/children/new">Add Child</Link>} />
      <StatGrid stats={[
        { label: 'children registered', value: children.length },
        { label: 'upcoming vaccines', value: upcoming.length },
        { label: 'missed vaccines', value: missed.length },
        { label: 'unread reminders', value: reminders.filter((r) => r.status === 'unread').length }
      ]} />
      <div className="row g-3 mt-1">
        {children.slice(0, 3).map((child) => <div className="col-12" key={child.id}><ChildCard child={child} /></div>)}
      </div>
    </>
  );
};

export const MyChildren = () => {
  const { data: children, loading, error } = useApi('/children/my-children', 'children');
  const [search, setSearch] = useState('');
  const filtered = children.filter((child) => child.full_name.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="My Children" subtitle="Register children and open their immunisation timelines." action={<Link className="btn btn-primary" to="/caregiver/children/new">Add Child</Link>} />
      <AlertMessage type="danger" message={error} />
      <div className="filter-bar mb-3"><SearchBox value={search} onChange={setSearch} placeholder="Search children" /></div>
      <div className="row g-3">{filtered.map((child) => <div className="col-12" key={child.id}><ChildCard child={child} /></div>)}</div>
    </>
  );
};

const ChildForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyChild);
  const [facilities, setFacilities] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/health-facilities').then((res) => setFacilities(res.data.facilities || []));
    if (mode === 'edit') {
      api.get(`/children/${id}`).then((res) => {
        const child = res.data.child;
        setForm({ ...emptyChild, ...child, date_of_birth: child.date_of_birth?.slice(0, 10), health_facility_id: child.health_facility_id || '' });
      });
    }
  }, [id, mode]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'edit') await api.put(`/children/${id}`, form);
      else await api.post('/children', form);
      setMessage('Child saved successfully');
      setTimeout(() => navigate('/caregiver/children'), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save child');
    }
  };

  return (
    <>
      <PageHeader title={mode === 'edit' ? 'Edit Child' : 'Add Child'} subtitle="Dates are used to calculate vaccine due visits from the active schedule." />
      <form className="app-card" onSubmit={submit}>
        <AlertMessage type="success" message={message} />
        <AlertMessage type="danger" message={error} />
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
          <div className="col-md-6"><label className="form-label">Date of birth</label><input className="form-control" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} required /></div>
          <div className="col-md-4"><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></div>
          <div className="col-md-4"><label className="form-label">District</label><input className="form-control" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required /></div>
          <div className="col-md-4"><label className="form-label">Sub-county / parish</label><input className="form-control" value={form.subcounty || ''} onChange={(e) => setForm({ ...form, subcounty: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Birth place or facility</label><input className="form-control" value={form.birth_place || ''} onChange={(e) => setForm({ ...form, birth_place: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Usual health facility</label><select className="form-select" value={form.health_facility_id || ''} onChange={(e) => setForm({ ...form, health_facility_id: e.target.value })}><option value="">Not selected</option>{facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label">Immunisation card number</label><input className="form-control" value={form.immunisation_card_number || ''} onChange={(e) => setForm({ ...form, immunisation_card_number: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary mt-4">Save Child</button>
      </form>
    </>
  );
};

export const AddChild = ({ mode }) => <ChildForm mode={mode} />;

export const ChildDetails = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/children/${id}`).then((res) => setChild(res.data.child)).catch((err) => setError(err.response?.data?.message || 'Child not found'));
  }, [id]);

  if (!child && !error) return <Loading />;
  return (
    <>
      <PageHeader title={child?.full_name || 'Child Details'} action={<Link className="btn btn-primary" to={`/caregiver/children/${id}/timeline`}>Open Timeline</Link>} />
      <AlertMessage type="danger" message={error} />
      {child && <div className="app-card detail-grid">
        <div><span>Date of birth</span><strong>{formatDate(child.date_of_birth)}</strong></div>
        <div><span>Gender</span><strong>{child.gender}</strong></div>
        <div><span>District</span><strong>{child.district}</strong></div>
        <div><span>Health facility</span><strong>{child.health_facility_name || 'Not selected'}</strong></div>
        <div><span>Card number</span><strong>{child.immunisation_card_number || 'Not recorded'}</strong></div>
      </div>}
    </>
  );
};

export const ImmunisationTimeline = () => {
  const { id } = useParams();
  const { data: events, loading, refresh } = useApi(`/immunisations/child/${id}`, 'immunisations');
  const [error, setError] = useState('');

  const complete = async (event) => {
    if (!window.confirm(`Mark ${event.vaccine_name} as completed?`)) return;
    await api.put(`/immunisations/${event.id}/complete`, { date_received: new Date().toISOString().slice(0, 10) });
    refresh();
  };

  const missed = async (event) => {
    if (!window.confirm(`Mark ${event.vaccine_name} as missed?`)) return;
    try {
      await api.put(`/immunisations/${event.id}/missed`, { notes: 'Marked from caregiver timeline' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update immunisation');
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="Immunisation Timeline" subtitle="Expected visits are generated from the editable schedule and the child date of birth." />
      <AlertMessage type="danger" message={error} />
      <EventTable events={events} onComplete={complete} onMissed={missed} />
    </>
  );
};

const StatusListPage = ({ title, endpoint, subtitle }) => {
  const { data, loading, error } = useApi(endpoint, 'immunisations');
  const [search, setSearch] = useState('');
  const filtered = data.filter((item) => `${item.child_name} ${item.vaccine_name}`.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <AlertMessage type="danger" message={error} />
      <div className="filter-bar mb-3"><SearchBox value={search} onChange={setSearch} placeholder="Search child or vaccine" /></div>
      <EventTable events={filtered} />
    </>
  );
};

export const UpcomingImmunisations = () => <StatusListPage title="Upcoming Immunisations" subtitle="Vaccines due in the next reminder window." endpoint="/immunisations/upcoming" />;
export const MissedImmunisations = () => <StatusListPage title="Missed Immunisations" subtitle="Overdue vaccines that need follow-up." endpoint="/immunisations/missed" />;

export const MyReminders = () => {
  const { data: reminders, loading, refresh } = useApi('/reminders/my-reminders', 'reminders');
  const markRead = async (id) => {
    await api.put(`/reminders/${id}/read`);
    refresh();
  };
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="My Reminders" subtitle="In-app reminders are stored here for current and overdue visits." action={<button className="btn btn-outline-primary" onClick={() => api.post('/reminders/generate').then(refresh)}>Generate</button>} />
      <div className="v-stack">
        {reminders.map((reminder) => (
          <div className="app-card reminder-row" key={reminder.id}>
            <div><StatusBadge status={reminder.status === 'unread' ? 'upcoming' : 'inactive'} /> <strong>{reminder.child_name}</strong><p>{reminder.message}</p><span>{formatDate(reminder.reminder_date)}</span></div>
            {reminder.status === 'unread' && <button className="btn btn-sm btn-outline-primary" onClick={() => markRead(reminder.id)}>Mark read</button>}
          </div>
        ))}
      </div>
    </>
  );
};

export const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone, preferred_reminder_method: user.preferred_reminder_method || 'in_app' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    await api.put('/users/me', form);
    setMessage('Profile updated. Refresh to reload your session details.');
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage phone number, reminder preference, and appearance." />
      <form className="app-card" onSubmit={submit}>
        <AlertMessage type="success" message={message} />
        <label className="form-label">Full name</label><input className="form-control mb-3" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <label className="form-label">Phone</label><input className="form-control mb-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        
        <label className="form-label">Preferred reminder method</label>
        <select className="form-select mb-4" value={form.preferred_reminder_method} onChange={(e) => setForm({ ...form, preferred_reminder_method: e.target.value })}>
          <option value="in_app">In-app</option>
          <option value="sms">SMS later</option>
          <option value="whatsapp">WhatsApp later</option>
        </select>

        <label className="form-label d-block">App Appearance</label>
        <div className="btn-group mb-4 w-100 shadow-sm" role="group" aria-label="Theme Mode Selection">
          <button 
            type="button" 
            className={`btn py-2 ${theme === 'light' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setTheme('light')}
          >
            ☀️ Light Mode
          </button>
          <button 
            type="button" 
            className={`btn py-2 ${theme === 'dark' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setTheme('dark')}
          >
            🌙 Dark Mode
          </button>
        </div>

        <button className="btn btn-primary d-block w-100 py-2">Save Profile</button>
      </form>
    </>
  );
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((res) => setStats(res.data.stats)); }, []);
  if (!stats) return <Loading />;
  return (
    <>
      <PageHeader title="Health Worker Dashboard" subtitle="Monitor children due for vaccines and missed visits." />
      <StatGrid stats={[
        { label: 'total children', value: stats.total_children },
        { label: 'fully immunised', value: stats.fully_immunised },
        { label: 'missed vaccines', value: stats.missed_vaccines },
        { label: 'upcoming this week', value: stats.upcoming_this_week },
        { label: 'completed this month', value: stats.completed_this_month }
      ]} />
    </>
  );
};

export const ManageUsers = () => {
  const { data: users, loading } = useApi('/admin/users', 'users');
  const [search, setSearch] = useState('');
  const filtered = users.filter((user) => `${user.full_name} ${user.phone} ${user.email}`.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="Mothers and Caregivers" subtitle="Registered users and reminder preferences." />
      <div className="filter-bar mb-3"><SearchBox value={search} onChange={setSearch} /></div>
      <div className="table-responsive app-card"><table className="table mb-0"><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td>{user.full_name}</td><td>{user.phone}</td><td>{user.email}</td><td>{user.role}</td><td><StatusBadge status={user.status} /></td></tr>)}</tbody></table></div>
    </>
  );
};

export const ManageChildren = () => {
  const { data: children, loading } = useApi('/admin/children', 'children');
  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="Registered Children" subtitle="All child profiles visible to health workers." />
      <div className="table-responsive app-card"><table className="table mb-0"><thead><tr><th>Child</th><th>Caregiver</th><th>DOB</th><th>District</th><th>Facility</th></tr></thead><tbody>{children.map((child) => <tr key={child.id}><td>{child.full_name}</td><td>{child.caregiver_name}<div className="small text-muted">{child.caregiver_phone}</div></td><td>{formatDate(child.date_of_birth)}</td><td>{child.district}</td><td>{child.health_facility_name || 'Not selected'}</td></tr>)}</tbody></table></div>
    </>
  );
};

export const ManageSchedule = () => {
  const { data: schedule, loading, refresh } = useApi('/schedule', 'schedule');
  const [form, setForm] = useState(emptySchedule);
  const [editingId, setEditingId] = useState(null);

  const edit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, is_required: Boolean(item.is_required) });
  };
  const save = async (event) => {
    event.preventDefault();
    if (editingId) await api.put(`/schedule/${editingId}`, form);
    else await api.post('/schedule', form);
    setEditingId(null);
    setForm(emptySchedule);
    refresh();
  };
  const toggle = async (item) => {
    await api.put(`/schedule/${item.id}/status`, { is_active: !item.is_active });
    refresh();
  };
  const deleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.vaccine_name}?`)) return;
    await api.delete(`/schedule/${item.id}`);
    refresh();
  };

  if (loading) return <Loading />;
  return (
    <>
      <PageHeader title="Manage Immunisation Schedule" subtitle="Schedule items are editable because national guidance can change." />
      <form className="app-card mb-3" onSubmit={save}>
        <div className="row g-3">
          <div className="col-md-4"><input className="form-control" placeholder="Vaccine name" value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })} required /></div>
          <div className="col-md-3"><input className="form-control" placeholder="Age label" value={form.recommended_age_label} onChange={(e) => setForm({ ...form, recommended_age_label: e.target.value })} required /></div>
          <div className="col-md-2"><input className="form-control" type="number" placeholder="Offset days" value={form.due_offset_days} onChange={(e) => setForm({ ...form, due_offset_days: e.target.value })} required /></div>
          <div className="col-md-2"><input className="form-control" type="number" placeholder="Dose" value={form.dose_number} onChange={(e) => setForm({ ...form, dose_number: e.target.value })} /></div>
          <div className="col-md-1"><button className="btn btn-primary w-100">{editingId ? 'Save' : 'Add'}</button></div>
          <div className="col-12"><textarea className="form-control" rows="2" placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </form>
      <div className="table-responsive app-card"><table className="table mb-0"><thead><tr><th>Vaccine</th><th>Age</th><th>Offset</th><th>Dose</th><th>Required</th><th>Status</th><th /></tr></thead><tbody>{schedule.map((item) => <tr key={item.id}><td>{item.vaccine_name}<div className="small text-muted">{item.description}</div></td><td>{item.recommended_age_label}</td><td>{item.due_offset_days} days</td><td>{item.dose_number}</td><td>{item.is_required ? 'Yes' : 'Optional'}</td><td>{item.is_active ? 'Active' : 'Inactive'}</td><td className="text-end"><div className="d-flex justify-content-end gap-2 flex-nowrap"><button className="btn btn-sm btn-outline-primary" onClick={() => edit(item)}>Edit</button><button className="btn btn-sm btn-outline-secondary" onClick={() => toggle(item)}>{item.is_active ? 'Deactivate' : 'Activate'}</button><button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item)}>Delete</button></div></td></tr>)}</tbody></table></div>
    </>
  );
};

export const DueThisWeek = () => <StatusListPage title="Children Due This Week" endpoint="/admin/due-this-week" subtitle="Children requiring follow-up in the next seven days." />;
export const MissedCases = () => <StatusListPage title="Missed Immunisation Cases" endpoint="/admin/missed-immunisations" subtitle="Overdue vaccines across registered children." />;

export const Reports = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((res) => setStats(res.data.stats)); }, []);
  if (!stats) return <Loading />;
  const totalTracked = Math.max(stats.total_children, 1);
  const fullyPercent = Math.round((stats.fully_immunised / totalTracked) * 100);
  return (
    <>
      <PageHeader title="Reports" subtitle="Basic operational statistics for immunisation follow-up." />
      <StatGrid stats={[
        { label: 'fully immunised rate', value: `${fullyPercent}%` },
        { label: 'missed vaccines', value: stats.missed_vaccines },
        { label: 'completed this month', value: stats.completed_this_month }
      ]} />
      <div className="alert alert-warning mt-3">These figures support follow-up planning and do not replace official health facility records.</div>
    </>
  );
};

export const NotFound = () => (
  <main className="container py-5 narrow-page">
    <h1>Page not found</h1>
    <p>The page you requested is not available.</p>
    <Link className="btn btn-primary" to="/">Go home</Link>
  </main>
);
