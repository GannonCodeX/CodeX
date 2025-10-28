// src/sanity/lib/dashboard/applicationStats.js
export const applicationStatsWidget = {
  name: 'applicationStats',
  title: 'Application Statistics',
  type: 'component',
  component: () => {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
      // Fetch application statistics
      fetch('/api/application-stats')
        .then(res => res.json())
        .then(setStats);
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
      <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
        <h3>Project Applications Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <strong>{stats.pending}</strong>
            <div>Pending Review</div>
          </div>
          <div>
            <strong>{stats.reviewing}</strong>
            <div>Under Review</div>
          </div>
          <div>
            <strong>{stats.accepted}</strong>
            <div>Accepted</div>
          </div>
          <div>
            <strong>{stats.total}</strong>
            <div>Total Applications</div>
          </div>
        </div>
        
        <h4>Active Projects</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <strong>{stats.seekingContributors}</strong>
            <div>Seeking Contributors</div>
          </div>
          <div>
            <strong>{stats.inProgress}</strong>
            <div>In Progress</div>
          </div>
          <div>
            <strong>{stats.completed}</strong>
            <div>Completed</div>
          </div>
        </div>
      </div>
    );
  }
};