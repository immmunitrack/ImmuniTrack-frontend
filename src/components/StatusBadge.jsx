const classes = {
  completed: 'status-badge status-completed',
  upcoming: 'status-badge status-upcoming',
  pending: 'status-badge status-pending',
  missed: 'status-badge status-missed',
  active: 'badge text-bg-success',
  inactive: 'badge text-bg-secondary'
};

const StatusBadge = ({ status }) => <span className={classes[status] || 'badge text-bg-light'}>{status}</span>;

export default StatusBadge;
