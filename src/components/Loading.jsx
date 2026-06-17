const Loading = ({ label = 'Loading' }) => (
  <div className="loading-state">
    <div className="spinner-border text-primary" role="status" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default Loading;
