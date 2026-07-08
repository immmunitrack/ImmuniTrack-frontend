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
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'digital-card' | 'qr-code' | null
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    api.get(`/children/${id}`)
      .then((res) => setChild(res.data.child))
      .catch((err) => setError(err.response?.data?.message || 'Child not found'));

    api.get(`/immunisations/child/${id}`)
      .then((res) => {
        setRecords(res.data.immunisations || []);
        setLoadingRecords(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingRecords(false);
      });
  }, [id]);

  const handleDownload = () => {
    if (!child) return;
    const content = `IMMUNITRACK DIGITAL HEALTH PROFILE
==================================
Child Name:      ${child.full_name}
Date of Birth:   ${formatDate(child.date_of_birth)}
Gender:          ${child.gender}
District:        ${child.district}
Health Facility: ${child.health_facility_name || 'Not selected'}
Card Number:     ${child.immunisation_card_number || 'Not recorded'}
Generated On:    ${new Date().toLocaleDateString()}
==================================
Thank you for using ImmuniTrack to protect your child's health.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${child.full_name.replace(/\s+/g, '_')}_ImmuniTrack_Profile.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMarkComplete = async (record) => {
    if (!window.confirm(`Mark ${record.vaccine_name} as completed?`)) return;
    try {
      await api.put(`/immunisations/${record.id}/complete`, { date_received: new Date().toISOString().slice(0, 10) });
      api.get(`/immunisations/child/${id}`).then((res) => setRecords(res.data.immunisations || []));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleMarkMissed = async (record) => {
    if (!window.confirm(`Mark ${record.vaccine_name} as missed?`)) return;
    try {
      await api.put(`/immunisations/${record.id}/missed`, { notes: 'Marked from child details view' });
      api.get(`/immunisations/child/${id}`).then((res) => setRecords(res.data.immunisations || []));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const groupedRecords = useMemo(() => {
    const groups = {};
    records.forEach(record => {
      const ageLabel = record.recommended_age_label || 'Other';
      if (!groups[ageLabel]) {
        groups[ageLabel] = [];
      }
      groups[ageLabel].push(record);
    });
    return groups;
  }, [records]);

  const stats = useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.status === 'completed').length;
    const missed = records.filter(r => r.status === 'missed').length;
    const upcoming = records.filter(r => r.status === 'upcoming' || r.status === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const nextVaccine = records
      .filter(r => r.status === 'upcoming' || r.status === 'pending')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    return { total, completed, missed, upcoming, completionRate, nextVaccine };
  }, [records]);

  if (!child && !error) return <Loading />;
  return (
    <>
      <PageHeader title={child?.full_name || 'Child Details'} action={<Link className="btn btn-primary" to={`/caregiver/children/${id}/timeline`}>Open Timeline</Link>} />
      <AlertMessage type="danger" message={error} />
      
      {child && (
        <div className="app-card detail-grid">
          <div><span>Date of birth</span><strong>{formatDate(child.date_of_birth)}</strong></div>
          <div><span>Gender</span><strong>{child.gender}</strong></div>
          <div><span>District</span><strong>{child.district}</strong></div>
          <div><span>Health facility</span><strong>{child.health_facility_name || 'Not selected'}</strong></div>
          <div><span>Card number</span><strong>{child.immunisation_card_number || 'Not recorded'}</strong></div>
        </div>
      )}

      {child && (
        <div className="row g-3 mt-3">
          <div className="col-6 col-sm-3">
            <button
              className="btn action-grid-btn w-100 py-3 px-2 d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
              onClick={() => setActiveModal('digital-card')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-4 0h4" />
              </svg>
              <span>Digital Card</span>
            </button>
          </div>
          <div className="col-6 col-sm-3">
            <button
              className="btn action-grid-btn w-100 py-3 px-2 d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
              onClick={handleDownload}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
          </div>
          <div className="col-6 col-sm-3">
            <button
              className="btn action-grid-btn w-100 py-3 px-2 d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
              onClick={() => setActiveModal('qr-code')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5.01 20h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>QR Code</span>
            </button>
          </div>
          <div className="col-6 col-sm-3">
            <button
              className="btn action-grid-btn w-100 py-3 px-2 d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
              onClick={() => navigate(`/caregiver/children/${id}/timeline`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid block for history and full record of vaccines */}
      {child && !loadingRecords && records.length > 0 && (
        <div className="row g-4 mt-4">
          {/* Left Column: Progress & Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ background: 'var(--immuni-white, #ffffff)' }}>
              <div className="p-4 text-white" style={{ background: 'linear-gradient(135deg, #005f60 0%, #00b8a9 100%)' }}>
                <h4 className="m-0 h5 font-weight-medium text-white">Immunisation Progress</h4>
                <small style={{ opacity: 0.8 }}>Compliance and tracking metrics</small>
                
                <div className="d-flex align-items-center gap-3 mt-4">
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <svg width="80" height="80" viewBox="0 0 36 36">
                      <path stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path stroke="#ffffff" strokeDasharray={`${stats.completionRate}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <strong className="position-absolute text-white" style={{ fontSize: '1.2rem' }}>{stats.completionRate}%</strong>
                  </div>
                  <div>
                    <h3 className="m-0 font-weight-medium text-white" style={{ fontSize: '1.5rem' }}>{stats.completed} / {stats.total}</h3>
                    <span className="small text-white-50" style={{ opacity: 0.8 }}>Doses Received</span>
                  </div>
                </div>
              </div>

              <div className="p-4 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-success" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                    Completed
                  </span>
                  <strong className="text-success">{stats.completed}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-danger" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                    Missed
                  </span>
                  <strong className="text-danger">{stats.missed}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span className="text-muted d-flex align-items-center gap-2">
                    <span className="badge rounded-circle bg-warning" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                    Upcoming / Pending
                  </span>
                  <strong className="text-warning">{stats.upcoming}</strong>
                </div>

                {stats.nextVaccine ? (
                  <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(0, 95, 96, 0.05)', border: '1px solid rgba(0, 95, 96, 0.1)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-uppercase font-weight-medium text-primary" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Next Up</span>
                      <span className="badge bg-warning text-dark font-weight-medium" style={{ fontSize: '0.65rem' }}>Pending</span>
                    </div>
                    <h5 className="m-0 h6 text-dark dark:text-white font-weight-medium">{stats.nextVaccine.vaccine_name}</h5>
                    <p className="m-0 mt-1 small text-muted">Due: {formatDate(stats.nextVaccine.due_date)}</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-3 text-center bg-light text-muted small">
                    🎉 Fully Immunised! No upcoming doses.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Complete Milestone Records */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: 'var(--immuni-white, #ffffff)' }}>
              <h4 className="m-0 h5 font-weight-medium">Vaccine Schedule & Records</h4>
              <p className="m-0 small text-muted mb-4">Complete milestone record checklist.</p>

              <div className="d-flex flex-column gap-4">
                {Object.keys(groupedRecords).map(ageLabel => (
                  <div key={ageLabel} className="border-bottom pb-3 last:border-0 last:pb-0">
                    <h5 className="h6 font-weight-medium mb-3 text-primary d-flex align-items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {ageLabel}
                    </h5>

                    <div className="row g-2">
                      {groupedRecords[ageLabel].map(record => {
                        let statusColorClass = 'bg-warning-subtle text-warning border border-warning-subtle';
                        let badgeLabel = 'Pending';
                        if (record.status === 'completed') {
                          statusColorClass = 'bg-success-subtle text-success border border-success-subtle';
                          badgeLabel = 'Completed';
                        } else if (record.status === 'missed') {
                          statusColorClass = 'bg-danger-subtle text-danger border border-danger-subtle';
                          badgeLabel = 'Missed';
                        }

                        return (
                          <div key={record.id} className="col-md-6">
                            <div className="p-3 rounded-3 border d-flex justify-content-between align-items-start gap-2 h-100 transition-all hover-shadow-sm" style={{ background: 'var(--background)' }}>
                              <div>
                                <h6 className="m-0 font-weight-medium text-dark dark:text-light" style={{ fontSize: '0.9rem' }}>{record.vaccine_name}</h6>
                                <p className="m-0 mt-1 small text-muted" style={{ fontSize: '0.78rem' }}>
                                  {record.status === 'completed' 
                                    ? `Given: ${formatDate(record.date_received)}` 
                                    : `Due: ${formatDate(record.due_date)}`
                                  }
                                </p>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-2">
                                <span className={`badge rounded-pill px-2 py-1 small font-weight-medium ${statusColorClass}`} style={{ fontSize: '0.7rem' }}>
                                  {badgeLabel}
                                </span>
                                {record.status !== 'completed' && (
                                  <div className="d-flex gap-1 mt-1">
                                    <button 
                                      className="btn btn-sm btn-outline-success p-1 rounded" 
                                      title="Mark Completed"
                                      onClick={() => handleMarkComplete(record)}
                                      style={{ width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}
                                    >
                                      ✓
                                    </button>
                                    {record.status !== 'missed' && (
                                      <button 
                                        className="btn btn-sm btn-outline-danger p-1 rounded" 
                                        title="Mark Missed"
                                        onClick={() => handleMarkMissed(record)}
                                        style={{ width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}
                                      >
                                        ✗
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Card Modal */}
      {activeModal === 'digital-card' && child && (
        <div className="custom-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="custom-modal-content p-4" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="m-0 h5 font-weight-medium text-dark">Digital Immunisation Card</h3>
              <button className="btn-close" onClick={() => setActiveModal(null)} aria-label="Close"></button>
            </div>
            
            <div className="digital-medical-card">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4 className="m-0 text-white font-weight-medium" style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>ImmuniTrack</h4>
                  <small style={{ opacity: 0.8, fontSize: '0.75rem' }}>E-Health ID Card</small>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                </svg>
              </div>

              <div className="mb-3">
                <small style={{ opacity: 0.7, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', letterSpacing: '1px' }}>Child Name</small>
                <strong style={{ fontSize: '1.1rem', fontWeight: 600 }}>{child.full_name}</strong>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <small style={{ opacity: 0.7, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', letterSpacing: '1px' }}>Date of birth</small>
                  <strong>{formatDate(child.date_of_birth)}</strong>
                </div>
                <div className="col-6">
                  <small style={{ opacity: 0.7, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', letterSpacing: '1px' }}>Gender</small>
                  <strong>{child.gender}</strong>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <small style={{ opacity: 0.7, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', letterSpacing: '1px' }}>Card number</small>
                  <strong>{child.immunisation_card_number || 'N/A'}</strong>
                </div>
                <div className="col-6">
                  <small style={{ opacity: 0.7, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', letterSpacing: '1px' }}>Facility</small>
                  <strong className="text-truncate d-block">{child.health_facility_name || 'Not Selected'}</strong>
                </div>
              </div>
            </div>

            <div className="mt-3 text-end">
              <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {activeModal === 'qr-code' && child && (
        <div className="custom-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="custom-modal-content p-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 text-start">
              <h3 className="m-0 h5 font-weight-medium text-dark">Verifiable QR Code</h3>
              <button className="btn-close" onClick={() => setActiveModal(null)} aria-label="Close"></button>
            </div>
            
            <p className="small text-muted mb-3">Present this code at any participating clinic or border checkpoint to securely access and verify vaccine records.</p>
            
            <div className="d-inline-flex p-3 bg-white border border-light rounded-4 shadow-sm">
              <svg width="180" height="180" viewBox="0 0 29 29" fill="none" className="text-dark">
                <path d="M1 1h7v7H1V1zm1 1v5h5V2H2zm1 1h3v3H3V3z" fill="currentColor" fillRule="evenodd" />
                <path d="M21 1h7v7h-7V1zm1 1v5h5V2h-5zm1 1h3v3H3V3z" fill="currentColor" fillRule="evenodd" />
                <path d="M1 21h7v7H1v-7zm1 1v5h5v-5H2zm1 1h3v3H3v-3z" fill="currentColor" fillRule="evenodd" />
                <rect x="4" y="10" width="2" height="2" fill="currentColor" />
                <rect x="10" y="4" width="2" height="2" fill="currentColor" />
                <rect x="12" y="8" width="2" height="2" fill="currentColor" />
                <rect x="14" y="2" width="2" height="2" fill="currentColor" />
                <rect x="8" y="14" width="2" height="2" fill="currentColor" />
                <rect x="10" y="12" width="2" height="2" fill="currentColor" />
                <rect x="14" y="10" width="2" height="2" fill="currentColor" />
                <rect x="16" y="14" width="2" height="2" fill="currentColor" />
                <rect x="22" y="10" width="2" height="2" fill="currentColor" />
                <rect x="24" y="12" width="2" height="2" fill="currentColor" />
                <rect x="10" y="22" width="2" height="2" fill="currentColor" />
                <rect x="12" y="24" width="2" height="2" fill="currentColor" />
                <rect x="18" y="18" width="3" height="3" fill="currentColor" />
                <rect x="23" y="23" width="3" height="3" fill="currentColor" />
                <rect x="18" y="23" width="2" height="2" fill="currentColor" />
                <rect x="23" y="18" width="2" height="2" fill="currentColor" />
              </svg>
            </div>

            <div className="mt-3">
              <code className="text-secondary font-weight-medium bg-light px-3 py-2 rounded-pill small d-inline-block">
                ID: {child.immunisation_card_number || child.id}
              </code>
            </div>

            <div className="mt-4">
              <button className="btn btn-primary w-100 py-2" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
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

  const complianceRate = Math.round((stats.fully_immunised / Math.max(stats.total_children, 1)) * 100);

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

      <div className="row g-4 mt-2">
        {/* Compliance Progress Visual */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: 'var(--immuni-white, #ffffff)' }}>
            <h4 className="h5 font-weight-medium text-dark mb-3">Clinic Compliance Rate</h4>
            <div className="d-flex align-items-center gap-4 py-3">
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <svg width="100" height="100" viewBox="0 0 36 36">
                  <path stroke="rgba(0, 95, 96, 0.08)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="#005f60" strokeDasharray={`${complianceRate}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }} />
                </svg>
                <strong className="position-absolute text-primary" style={{ fontSize: '1.4rem' }}>{complianceRate}%</strong>
              </div>
              <div>
                <p className="m-0 text-muted small">This rate indicates the proportion of registered children who are fully immunised according to their growth milestones.</p>
                <div className="d-flex align-items-center gap-2 mt-3">
                  <span className="badge bg-success-subtle text-success px-2.5 py-1.5 font-weight-medium rounded-pill" style={{ fontSize: '0.75rem' }}>
                    {stats.fully_immunised} Fully Protected
                  </span>
                  <span className="text-muted small">out of {stats.total_children} total children</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Indicators Breakdown Visual */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: 'var(--immuni-white, #ffffff)' }}>
            <h4 className="h5 font-weight-medium text-dark mb-3">Weekly Operational Indicators</h4>
            
            <div className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted font-weight-medium">Overdue Doses Impact</span>
                  <span className="small font-weight-medium text-danger">{stats.missed_vaccines} overdue</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="progress-bar bg-danger" style={{ width: `${Math.min((stats.missed_vaccines / Math.max(stats.total_children, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted font-weight-medium">Upcoming Doses This Week</span>
                  <span className="small font-weight-medium text-warning">{stats.upcoming_this_week} scheduled</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${Math.min((stats.upcoming_this_week / Math.max(stats.total_children, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted font-weight-medium">Completed Doses This Month</span>
                  <span className="small font-weight-medium text-success">{stats.completed_this_month} success</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="progress-bar bg-success" style={{ width: `${Math.min((stats.completed_this_month / Math.max(stats.total_children, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  const { user } = useAuth();
  const [reportType, setReportType] = useState('passport'); // 'passport' | 'coverage'
  const [selectedChildId, setSelectedChildId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Data for the generated reports
  const [childData, setChildData] = useState(null);
  const [childRecords, setChildRecords] = useState([]);
  const [coverageStats, setCoverageStats] = useState(null);

  // Load children depending on user role
  useEffect(() => {
    const fetchChildrenList = async () => {
      try {
        const url = user?.role === 'caregiver' ? '/children/my-children' : '/admin/children';
        const res = await api.get(url);
        const list = res.data.children || [];
        setChildren(list);
        if (list.length > 0) {
          setSelectedChildId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching children', err);
      }
    };
    if (user) fetchChildrenList();
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsGenerated(false);
    
    try {
      if (reportType === 'passport') {
        if (!selectedChildId) {
          alert('Please select a child');
          setLoading(false);
          return;
        }
        const childRes = await api.get(`/children/${selectedChildId}`);
        setChildData(childRes.data.child);

        const immRes = await api.get(`/immunisations/child/${selectedChildId}`);
        let records = immRes.data.immunisations || [];
        
        // Filter by dates if provided
        if (startDate) {
          records = records.filter(r => {
            const date = r.status === 'completed' ? r.date_received : r.due_date;
            return date && new Date(date) >= new Date(startDate);
          });
        }
        if (endDate) {
          records = records.filter(r => {
            const date = r.status === 'completed' ? r.date_received : r.due_date;
            return date && new Date(date) <= new Date(endDate);
          });
        }
        setChildRecords(records);
      } else {
        const statsRes = await api.get('/admin/stats');
        setCoverageStats(statsRes.data.stats);
      }
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      alert('Error generating report details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageHeader title="Report Generator" subtitle="Generate printable, verifiable health reports and immunization passports." />
      
      {/* Filters Form */}
      <form className="app-card mb-4" onSubmit={handleGenerate}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label font-weight-medium">Report Type</label>
            <select className="form-select" value={reportType} onChange={(e) => { setReportType(e.target.value); setIsGenerated(false); }}>
              <option value="passport">Child Immunization Passport</option>
              <option value="coverage">Clinic Coverage Report</option>
            </select>
          </div>
          
          {reportType === 'passport' && (
            <div className="col-md-3">
              <label className="form-label font-weight-medium">Select Child</label>
              <select className="form-select" value={selectedChildId} onChange={(e) => { setSelectedChildId(e.target.value); setIsGenerated(false); }}>
                {children.length === 0 ? (
                  <option value="">No children found</option>
                ) : (
                  children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)
                )}
              </select>
            </div>
          )}

          <div className="col-md-2">
            <label className="form-label font-weight-medium">Start Date</label>
            <input className="form-control" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setIsGenerated(false); }} />
          </div>

          <div className="col-md-2">
            <label className="form-label font-weight-medium">End Date</label>
            <input className="form-control" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setIsGenerated(false); }} />
          </div>

          <div className="col-md-2">
            <button className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading ? (
                <span>Generating...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generated Report Print Preview */}
      {isGenerated && (
        <div className="d-flex flex-column gap-3 mb-5">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="m-0 font-weight-medium text-muted">Print Preview</h5>
            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={handlePrint}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Export PDF / Print</span>
            </button>
          </div>

          <div id="printable-report-area" className="print-preview-sheet shadow-lg p-5 rounded-4 bg-white border border-light">
            {/* Header Block */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={logoImage}
                  alt="ImmuniTrack Logo"
                  style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '12px' }}
                />
                <div>
                  <h3 className="m-0 font-weight-medium text-dark" style={{ fontSize: '1.5rem', letterSpacing: '0.5px' }}>ImmuniTrack</h3>
                  <small className="text-muted uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Official Immunisation System</small>
                </div>
              </div>
              <div className="text-end">
                <h4 className="m-0 font-weight-medium text-primary" style={{ fontSize: '1.2rem' }}>
                  {reportType === 'passport' ? 'Child Immunization Passport' : 'Clinic Coverage & Operations Report'}
                </h4>
                <small className="text-muted d-block mt-1">Generated: {new Date().toLocaleDateString()}</small>
                {startDate && endDate && (
                  <small className="text-muted d-block font-weight-medium">Range: {formatDate(startDate)} to {formatDate(endDate)}</small>
                )}
              </div>
            </div>

            {/* Child Immunization Passport Body */}
            {reportType === 'passport' && childData && (
              <div>
                <h5 className="h6 font-weight-medium mb-3 text-uppercase text-secondary border-bottom pb-2" style={{ letterSpacing: '0.5px' }}>Demographic Information</h5>
                <div className="row g-3 mb-4">
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Child Full Name</span>
                    <strong className="text-dark">{childData.full_name}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Date of Birth</span>
                    <strong className="text-dark">{formatDate(childData.date_of_birth)}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Gender</span>
                    <strong className="text-dark">{childData.gender}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Immunisation Card No.</span>
                    <strong className="text-dark">{childData.immunisation_card_number || 'Not Recorded'}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Registered Caregiver</span>
                    <strong className="text-dark">{childData.caregiver_name || 'Not Listed'}</strong>
                  </div>
                  <div className="col-sm-4">
                    <span className="small text-muted d-block">Primary Facility</span>
                    <strong className="text-dark">{childData.health_facility_name || 'Not Selected'}</strong>
                  </div>
                </div>

                <h5 className="h6 font-weight-medium mb-3 text-uppercase text-secondary border-bottom pb-2" style={{ letterSpacing: '0.5px' }}>Immunisation Record Checklist</h5>
                <table className="table table-bordered table-striped align-middle mb-4">
                  <thead>
                    <tr>
                      <th>Vaccine Name / visit</th>
                      <th>Dose No.</th>
                      <th>Target Age Milestone</th>
                      <th>Expected / Due Date</th>
                      <th>Administration Status</th>
                      <th>Date Administered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">No immunization records matching the criteria.</td>
                      </tr>
                    ) : (
                      childRecords.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.vaccine_name}</strong></td>
                          <td>{r.dose_number || 1}</td>
                          <td>{r.recommended_age_label}</td>
                          <td>{formatDate(r.due_date)}</td>
                          <td>
                            <span className={`badge rounded-pill px-2 py-1 font-weight-medium ${
                              r.status === 'completed' ? 'bg-success text-white' : r.status === 'missed' ? 'bg-danger text-white' : 'bg-warning text-dark'
                            }`} style={{ fontSize: '0.75rem' }}>
                              {r.status}
                            </span>
                          </td>
                          <td>{r.status === 'completed' ? formatDate(r.date_received) : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Clinic Coverage Report Body */}
            {reportType === 'coverage' && coverageStats && (
              <div>
                <h5 className="h6 font-weight-medium mb-3 text-uppercase text-secondary border-bottom pb-2" style={{ letterSpacing: '0.5px' }}>Operational Statistics Summary</h5>
                <div className="row g-3 mb-5">
                  <div className="col-sm-4">
                    <div className="p-3 border rounded-3 bg-light text-center h-100">
                      <span className="small text-muted d-block text-uppercase">Total Tracked Children</span>
                      <strong className="text-dark display-6 font-weight-medium">{coverageStats.total_children}</strong>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 border rounded-3 bg-light text-center h-100">
                      <span className="small text-muted d-block text-uppercase">Fully Immunised Doses</span>
                      <strong className="text-dark display-6 font-weight-medium">{coverageStats.fully_immunised}</strong>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 border rounded-3 bg-light text-center h-100">
                      <span className="small text-muted d-block text-uppercase">Missed Doses / Overdue</span>
                      <strong className="text-danger display-6 font-weight-medium">{coverageStats.missed_vaccines}</strong>
                    </div>
                  </div>
                </div>

                <h5 className="h6 font-weight-medium mb-3 text-uppercase text-secondary border-bottom pb-2" style={{ letterSpacing: '0.5px' }}>Monthly Operational Volume</h5>
                <table className="table table-bordered mb-5">
                  <tbody>
                    <tr>
                      <td><strong>Doses Completed This Month</strong></td>
                      <td>{coverageStats.completed_this_month} children / doses</td>
                    </tr>
                    <tr>
                      <td><strong>Doses Upcoming This Week</strong></td>
                      <td>{coverageStats.upcoming_this_week} scheduled actions</td>
                    </tr>
                    <tr>
                      <td><strong>Clinic Coverage Index</strong></td>
                      <td>
                        <strong>
                          {Math.round((coverageStats.fully_immunised / Math.max(coverageStats.total_children, 1)) * 100)}% Compliance
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Verification Footer Block */}
            <div className="row mt-5 pt-4 border-top">
              <div className="col-6">
                <span className="d-block small text-muted">Certification Statement</span>
                <p className="m-0 small text-muted mt-1" style={{ maxWidth: '380px' }}>
                  This document serves as an official printout generated from the ImmuniTrack digital health tracking platform. The information is current as of the generation timestamp.
                </p>
              </div>
              <div className="col-6 text-end">
                <div className="d-inline-block text-start" style={{ width: '220px' }}>
                  <div className="border-bottom pb-4 mb-1"></div>
                  <span className="small text-muted d-block text-center">Authorized Signature & Stamp</span>
                  <small className="text-muted d-block text-center mt-1">Date: ________________________</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const VaccineStock = () => {
  const [stockList, setStockList] = useState(() => {
    const saved = localStorage.getItem('immunitrack_vaccine_stock');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'BCG (Tuberculosis)', batch: 'BCG-2026-982', doses: 120, expiryDate: '2026-12-15', temperature: '4.2°C' },
      { id: 2, name: 'OPV (Oral Polio Vaccine)', batch: 'OPV-881-A', doses: 15, expiryDate: '2026-09-01', temperature: '5.0°C' },
      { id: 3, name: 'Rotavirus (Rotarix)', batch: 'ROTA-774-B', doses: 85, expiryDate: '2027-02-10', temperature: '3.8°C' },
      { id: 4, name: 'Pentavalent (DPT-HepB-Hib)', batch: 'PENTA-402-C', doses: 8, expiryDate: '2026-08-20', temperature: '4.5°C' },
      { id: 5, name: 'PCV (Pneumococcal Conjugate)', batch: 'PCV-109-Y', doses: 240, expiryDate: '2026-11-30', temperature: '4.0°C' },
      { id: 6, name: 'Measles-Rubella (MR)', batch: 'MR-305-D', doses: 45, expiryDate: '2026-10-15', temperature: '3.6°C' }
    ];
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', batch: '', quantity: '', expiryDate: '', temperature: '' });

  useEffect(() => {
    localStorage.setItem('immunitrack_vaccine_stock', JSON.stringify(stockList));
  }, [stockList]);

  // Compute metrics
  const totalDoses = stockList.reduce((sum, item) => sum + Number(item.doses), 0);
  
  const LOW_STOCK_THRESHOLD = 50;
  const lowStockCount = stockList.filter(item => item.doses < LOW_STOCK_THRESHOLD).length;

  const expiringBatchesCount = stockList.filter(item => {
    const expiry = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  }).length;

  const handleUpdateStock = (e) => {
    e.preventDefault();
    if (!form.name || !form.batch || !form.quantity) {
      alert('Please fill out all required fields');
      return;
    }

    const qty = Number(form.quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Quantity must be a positive number');
      return;
    }

    setStockList(prev => {
      const existingIdx = prev.findIndex(item => item.batch.toLowerCase() === form.batch.toLowerCase());
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          doses: updated[existingIdx].doses + qty,
          expiryDate: form.expiryDate || updated[existingIdx].expiryDate,
          temperature: form.temperature || updated[existingIdx].temperature
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: Date.now(),
            name: form.name,
            batch: form.batch,
            doses: qty,
            expiryDate: form.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
            temperature: form.temperature || '4.0°C'
          }
        ];
      }
    });

    setForm({ name: '', batch: '', quantity: '', expiryDate: '', temperature: '' });
    setShowModal(false);
  };

  return (
    <>
      <PageHeader 
        title="Vaccine Inventory & Stock" 
        subtitle="Real-time cold-chain status monitoring and dose levels tracking." 
        action={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Update Stock
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="app-card text-center p-3 border-0 shadow-sm rounded-4 position-relative overflow-hidden h-100" style={{ background: 'var(--immuni-white, #ffffff)' }}>
            <div className="text-uppercase small text-muted font-weight-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Active Doses</div>
            <div className="display-6 font-weight-medium mt-2 text-primary">{totalDoses}</div>
            <small className="text-muted d-block mt-1">Vials in cold storage</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="app-card text-center p-3 border-0 shadow-sm rounded-4 position-relative overflow-hidden h-100" style={{ background: 'var(--immuni-white, #ffffff)' }}>
            <div className="text-uppercase small text-muted font-weight-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Low Stock Warning</div>
            <div className="display-6 font-weight-medium mt-2 text-danger">{lowStockCount}</div>
            <small className="text-danger d-block mt-1">Below {LOW_STOCK_THRESHOLD} doses limit</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="app-card text-center p-3 border-0 shadow-sm rounded-4 position-relative overflow-hidden h-100" style={{ background: 'var(--immuni-white, #ffffff)' }}>
            <div className="text-uppercase small text-muted font-weight-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Expiring Batches</div>
            <div className="display-6 font-weight-medium mt-2 text-warning">{expiringBatchesCount}</div>
            <small className="text-warning d-block mt-1">Expiry within 90 days</small>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-responsive app-card mt-3">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>Vaccine Name</th>
              <th>Batch Number</th>
              <th>Available Doses</th>
              <th>Expiry Date</th>
              <th>Storage Temperature</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stockList.map(item => {
              const isLowStock = item.doses < LOW_STOCK_THRESHOLD;
              const expiry = new Date(item.expiryDate);
              const today = new Date();
              const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = diffDays > 0 && diffDays <= 90;

              return (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td><code className="text-secondary">{item.batch}</code></td>
                  <td>{item.doses}</td>
                  <td>
                    <span className={isExpiringSoon ? 'text-warning font-weight-medium' : ''}>
                      {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      {isExpiringSoon && <span className="small d-block text-warning" style={{ fontSize: '0.75rem' }}>⚠️ Expiring soon</span>}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      ❄️ {item.temperature}
                    </span>
                  </td>
                  <td>
                    {isLowStock ? (
                      <span className="badge bg-danger text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.7rem' }}>Low Stock</span>
                    ) : (
                      <span className="badge bg-success text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.7rem' }}>In Stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="custom-modal-content p-4" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="m-0 h5 font-weight-medium">Update Vaccine Inventory</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            
            <form onSubmit={handleUpdateStock}>
              <div className="mb-3">
                <label className="form-label font-weight-medium">Vaccine Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. OPV (Oral Polio Vaccine)" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label font-weight-medium">Batch Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. BATCH-123" 
                    value={form.batch} 
                    onChange={e => setForm(p => ({ ...p, batch: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-weight-medium">Quantity Received</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 100" 
                    value={form.quantity} 
                    onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-md-6">
                  <label className="form-label font-weight-medium">Expiry Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={form.expiryDate} 
                    onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-weight-medium">Storage Temperature</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 4.0°C" 
                    value={form.temperature} 
                    onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
