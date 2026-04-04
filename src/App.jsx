import React from 'react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Add Expense', icon: 'M12 4v16m8-8H4' },
    { name: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-color)'}}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Fin<span>Sight</span>
      </div>
      <div className="nav-links">
        {navItems.map((item, index) => (
          <div key={item.name} className={`nav-item ${index === 0 ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-search">
        Search transactions, reports...
      </div>
      <div className="user-profile">
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Welcome back, <strong style={{ color: 'var(--text-primary)' }}>Alex</strong></span>
        <div className="avatar"></div>
      </div>
    </nav>
  );
};

const StatCard = ({ title, value, trend, isUp }) => {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {title}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
        {isUp ? '↑' : '↓'} {trend} since last month
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="content">
      <h1>Overview Dashboard</h1>
      
      <div className="stats-grid">
        <StatCard title="Total Balance" value="$24,562.00" trend="12.5%" isUp={true} />
        <StatCard title="Total Expenses" value="$3,120.40" trend="2.4%" isUp={false} />
        <StatCard title="Savings" value="$8,450.00" trend="5.1%" isUp={true} />
      </div>

      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', fontWeight: '600' }}>Add Expense</button>
          <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontWeight: '600' }}>Export Stats</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <Dashboard />
      </div>
    </div>
  )
}

export default App
