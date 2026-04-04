import React, { useState, useEffect, useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const Sidebar = ({ onAddExpense }) => {
  const navItems = [
    { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Add Expense', icon: 'M12 4v16m8-8H4', onClick: onAddExpense },
    { name: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Fin<span>Sight</span>
      </div>
      <div className="nav-links">
        {navItems.map((item, index) => (
          <div
            key={item.name}
            className={`nav-item ${index === 0 ? 'active' : ''}`}
            onClick={item.onClick}
          >
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

const StatCard = ({ title, value, trend, isUp, color }) => {
  return (
    <div className="stat-card" style={{ '--card-accent': color || 'var(--accent-color)' }}>
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

const ExpenseModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount)) return;

    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
      id: Date.now()
    });

    setFormData({
      amount: '',
      category: 'General',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
              step="0.01"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option>General</option>
              <option>Food & Drink</option>
              <option>Housing</option>
              <option>Transport</option>
              <option>Utilities</option>
              <option>Entertainment</option>
              <option>Shopping</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Note</label>
            <textarea
              placeholder="What was this for?"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionList = ({ expenses }) => {
  return (
    <div className="transaction-section">
      <div className="section-header">
        <h3>Recent Transactions</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="transaction-list">
        {expenses.length === 0 ? (
          <div className="empty-state">No transactions yet. Add your first expense!</div>
        ) : (
          expenses.slice().reverse().map(exp => (
            <div key={exp.id} className="transaction-item">
              <div className="transaction-icon">
                {exp.category.charAt(0)}
              </div>
              <div className="transaction-info">
                <div className="transaction-name">{exp.note || exp.category}</div>
                <div className="transaction-date">{exp.date} • {exp.category}</div>
              </div>
              <div className="transaction-amount">
                -${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const CategorySpendingChart = ({ expenses }) => {
  const data = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    return Object.keys(categoryTotals).map(name => ({
      name,
      value: categoryTotals[name]
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3>Spending by Category</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MonthlyExpensesChart = ({ expenses }) => {
  const data = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const monthlyTotals = expenses.reduce((acc, exp) => {
      if (!exp.date) return acc;

      // Extract only numeric components from the date string
      const nums = String(exp.date).match(/\d+/g);
      if (!nums || nums.length < 2) return acc;

      let year, monthIdx, day;

      if (nums.length >= 3) {
        // Assume YYYY-MM-DD or standard numeric parts
        // Handle cases where year might be weirdly concatenated
        let yStr = nums[0];
        if (yStr.length > 4) yStr = yStr.slice(-4);
        year = parseInt(yStr, 10);
        monthIdx = parseInt(nums[1], 10) - 1;
        day = parseInt(nums[2], 10);
      } else {
        year = parseInt(nums[0], 10);
        monthIdx = parseInt(nums[1], 10) - 1;
        day = 1;
      }

      // Final sanitization of the date
      if (year < 100) year += 2000;
      if (year > 2100) year = new Date().getFullYear(); // Fallback for crazy years
      
      const date = new Date(year, monthIdx, day);
      if (isNaN(date.getTime())) return acc;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = monthNames[date.getMonth()];
      const yearLabel = date.getFullYear();
      const label = `${monthLabel} ${yearLabel}`;
      
      if (!acc[label]) {
        acc[label] = { label, total: 0, timestamp: new Date(yearLabel, date.getMonth(), 1).getTime() };
      }
      acc[label].total += exp.amount;
      return acc;
    }, {});

    return Object.values(monthlyTotals)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ label, total }) => ({ name: label, amount: total }));
  }, [expenses]);

  if (data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3>Monthly Expenses</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }}
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
            />
            <Bar dataKey="amount" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Dashboard = ({ expenses, onAddExpense }) => {
  const initialBalance = 24562.00;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentBalance = initialBalance - totalExpenses;

  // Placeholder trends
  const balanceTrend = "3.2%";
  const expenseTrend = expenses.length > 0 ? "8.4%" : "0.0%";

  return (
    <div className="content">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Overview Dashboard</h1>
          <p className="subtitle">Track and manage your financial health</p>
        </div>
        <button className="btn-primary" onClick={onAddExpense}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Expense
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Balance"
          value={`$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend={balanceTrend}
          isUp={true}
          color="var(--accent-color)"
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend={expenseTrend}
          isUp={false}
          color="var(--accent-error)"
        />
        <StatCard
          title="Savings"
          value="$8,450.00"
          trend="5.1%"
          isUp={true}
          color="var(--accent-secondary)"
        />
      </div>

      {expenses.length > 0 && (
        <div className="charts-grid">
          <CategorySpendingChart expenses={expenses} />
          <MonthlyExpensesChart expenses={expenses} />
        </div>
      )}

      <TransactionList expenses={expenses} />
    </div>
  );
};

function App() {
  const [expenses, setExpenses] = useState([
    { id: 1, amount: 45.50, category: 'Food & Drink', date: '2024-03-12', note: 'Lunch at Joe\'s' },
    { id: 2, amount: 1200.00, category: 'Housing', date: '2024-03-01', note: 'Monthly Rent' },
    { id: 3, amount: 65.00, category: 'Transport', date: '2024-03-15', note: 'Fuel' },
    { id: 4, amount: 85.20, category: 'Entertainment', date: '2024-03-20', note: 'Movie night' },
    { id: 5, amount: 210.00, category: 'Shopping', date: '2024-03-22', note: 'New clothes' },
    { id: 6, amount: 55.00, category: 'Utilities', date: '2024-03-25', note: 'Internet' },
    { id: 7, amount: 42.00, category: 'Food & Drink', date: '2024-02-12', note: 'Groceries' },
    { id: 8, amount: 1200.00, category: 'Housing', date: '2024-02-01', note: 'Monthly Rent' },
    { id: 9, amount: 150.00, category: 'Transport', date: '2024-02-18', note: 'Car repair' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addExpense = (newExpense) => {
    setExpenses([...expenses, newExpense]);
  };

  return (
    <div className="app-container">
      <Sidebar onAddExpense={() => setIsModalOpen(true)} />
      <div className="main-wrapper">
        <Navbar />
        <Dashboard
          expenses={expenses}
          onAddExpense={() => setIsModalOpen(true)}
        />
      </div>
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addExpense}
      />
    </div>
  )
}

export default App
