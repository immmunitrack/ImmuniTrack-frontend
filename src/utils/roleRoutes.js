export const dashboardFor = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'employer') return '/employer';
  if (role === 'job_seeker') return '/job-seeker';
  return '/jobs';
};

export const roleLabel = (role) => {
  if (role === 'job_seeker') return 'Job Seeker';
  if (role === 'employer') return 'Employer';
  if (role === 'admin') return 'Admin';
  return role;
};
