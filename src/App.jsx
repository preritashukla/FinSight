import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Login from './Login.jsx'
import InsightsPage from './Insights.jsx'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

// ─── Theme Toggle ───
const ThemeToggle = React.memo(({ theme, onToggle }) => (
  <div className="theme-toggle" onClick={onToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
    <div className={`theme-toggle-knob ${theme === 'light' ? 'light' : ''}`}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </div>
  </div>
));
ThemeToggle.displayName = 'ThemeToggle';

// ─── Toast Component ───
const Toast = ({ id, type, title, message, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleRemove(), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(id), 400);
  };

  return (
    <div className={`toast toast-${type} ${isRemoving ? 'removing' : ''}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '!'}
        {type === 'info' && 'i'}
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={handleRemove}>&times;</button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="toast-container">
    {toasts.map(toast => (
      <Toast key={toast.id} {...toast} onRemove={onRemove} />
    ))}
  </div>
);

// ─── Sidebar ───
const Sidebar = React.memo(({ onAddExpense }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = useMemo(() => [
    { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Add Expense', icon: 'M12 4v16m8-8H4', onClick: onAddExpense },
    { name: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2z', path: '/insights' }
  ], [onAddExpense]);

  return (
    <div className="sidebar">
      <div className="logo">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Fin<span>Sight</span>
      </div>
      <div className="nav-links">
        {navItems.map((item, index) => {
          const isDashboard = !item.path && item.name === 'Dashboard';
          const resolvedPath = isDashboard ? '/dashboard' : item.path;
          const isActive = resolvedPath && location.pathname === resolvedPath;
          const isSpecial = !item.path && item.onClick;
          
          if (isSpecial) {
            return (
              <div
                key={item.name}
                className="nav-item"
                onClick={(e) => {
                  console.log(`Special action clicked: ${item.name}`);
                  item.onClick(e);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.name}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={resolvedPath}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => console.log(`Navigation link clicked: ${item.name} -> ${resolvedPath}`)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

// ─── Navbar ───
const Navbar = React.memo(({ theme, onThemeToggle, userName, onLogout, searchQuery, onSearchChange }) => {
  // Derive initials for avatar
  const initials = useMemo(() => userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?', [userName]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <input 
          type="text" 
          className="navbar-search" 
          placeholder="🔍 Search transactions, reports..." 
          value={searchQuery || ''}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="navbar-right">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="user-profile">
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Welcome, <strong style={{ color: 'var(--text-primary)' }}>{userName || 'Guest'}</strong>
          </span>
          <div className="avatar" title={userName}>{initials}</div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
});
Navbar.displayName = 'Navbar';

// ─── Stat Card ───
const StatCard = React.memo(({ title, value, trend, isUp, color }) => {
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
});
StatCard.displayName = 'StatCard';

// ─── Spending Personality Tag ───
const PERSONALITY_PROFILES = [
  {
    tag: 'Impulsive Spender',
    emoji: '⚡',
    desc: 'You tend to make frequent, unplanned purchases. Consider setting a daily spending cap.',
    criteria: (expenses) => {
      if (expenses.length < 3) return false;
      const entertainmentAndShopping = expenses.filter(e =>
        ['Entertainment', 'Shopping'].includes(e.category)
      );
      return entertainmentAndShopping.reduce((s, e) => s + e.amount, 0) /
        expenses.reduce((s, e) => s + e.amount, 0) > 0.35;
    }
  },
  {
    tag: 'Balanced Saver',
    emoji: '⚖️',
    desc: 'Great balance! You manage essential vs discretionary spending wisely.',
    criteria: (expenses) => {
      if (expenses.length < 3) return false;
      const essentials = expenses.filter(e =>
        ['Housing', 'Utilities', 'Transport'].includes(e.category)
      );
      const essentialRatio = essentials.reduce((s, e) => s + e.amount, 0) /
        expenses.reduce((s, e) => s + e.amount, 0);
      return essentialRatio > 0.5 && essentialRatio <= 0.8;
    }
  },
  {
    tag: 'Foodie Enthusiast',
    emoji: '🍕',
    desc: 'Food & dining is your top discretionary category. Try meal-prepping to save!',
    criteria: (expenses) => {
      if (expenses.length < 2) return false;
      const food = expenses.filter(e =>
        e.category === 'Food & Drink' || e.category === 'Food and Drink'
      );
      return food.reduce((s, e) => s + e.amount, 0) /
        expenses.reduce((s, e) => s + e.amount, 0) > 0.25;
    }
  },
  {
    tag: 'Budget Rookie',
    emoji: '🌱',
    desc: 'Just getting started! Keep tracking expenses to build healthy financial habits.',
    criteria: (expenses) => expenses.length < 5
  },
  {
    tag: 'Smart Planner',
    emoji: '🧠',
    desc: 'You spread spending across categories sensibly. Keep up the discipline!',
    criteria: () => true // fallback
  }
];

const SpendingPersonalityTag = React.memo(({ expenses }) => {
  const personality = useMemo(() => {
    if (expenses.length === 0) return PERSONALITY_PROFILES[3]; // Budget Rookie
    for (const profile of PERSONALITY_PROFILES) {
      if (profile.criteria(expenses)) return profile;
    }
    return PERSONALITY_PROFILES[4]; // Smart Planner fallback
  }, [expenses]);

  return (
    <div className="personality-tag-container">
      <div className="personality-tag">
        <span className="personality-emoji">{personality.emoji}</span>
        <div className="personality-info">
          <span className="personality-label">Your Spending Personality</span>
          <span className="personality-name">{personality.tag}</span>
          <span className="personality-desc">{personality.desc}</span>
        </div>
      </div>
    </div>
  );
});
SpendingPersonalityTag.displayName = 'SpendingPersonalityTag';

// ─── Expense Modal ───
const ExpenseModal = React.memo(({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
    note: '',
    type: 'expense'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be positive';
    }
    if (!formData.category) {
      newErrors.category = 'Select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
        id: Date.now()
      });

      setFormData({
        amount: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        note: '',
        type: 'expense'
      });
      onClose();
    } catch (err) {
      // Error handled by parent via toast
    } finally {
      setIsSaving(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay" 
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={onClose}
        >
          <motion.div 
            className="modal-content premium-card" 
            variants={modalVariants}
            onClick={e => e.stopPropagation()}
            style={{ padding: '40px' }}
          >
            <div className="modal-header" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Add New Transaction</h2>
              <button className="close-btn" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="12"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="field-label">Transaction Type</label>
                <div className="type-toggle" style={{ background: 'var(--bg-solid-tertiary)', padding: '4px', borderRadius: '12px' }}>
                  <button 
                    type="button" 
                    className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Expense
                  </button>
                  <button 
                    type="button" 
                    className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Amount (₹)</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className={errors.amount ? 'input-error' : ''}
                    step="0.01"
                    autoFocus
                    disabled={isSaving}
                  />
                </div>
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="field-label">Category</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
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
                      <option>Investment</option>
                      <option>Salary</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Date</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Description (Optional)</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <textarea
                    placeholder="What was this for?"
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    rows="2"
                    style={{ padding: '12px 14px 12px 44px', resize: 'none' }}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '32px' }}>
                <button 
                  type="submit" 
                  className="btn-premium" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="spinner-sm"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Confirm Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
ExpenseModal.displayName = 'ExpenseModal';

const TransactionItem = React.memo(({ exp, idx }) => (
  <div className="transaction-item" style={{ animationDelay: `${idx * 0.05}s` }}>
    <div className="transaction-icon">
      {exp.category.charAt(0)}
    </div>
    <div className="transaction-info">
      <div className="transaction-name">{exp.note || exp.category}</div>
      <div className="transaction-date">{exp.date} • {exp.category}</div>
    </div>
    <div className="transaction-amount">
      -₹{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </div>
  </div>
));
TransactionItem.displayName = 'TransactionItem';

// ─── Transaction List ───
const TransactionList = React.memo(({ expenses, onClearFilters, hasFilters }) => {
  return (
    <div className="transaction-section">
      <div className="section-header">
        <h3>{hasFilters ? 'Filtered Transactions' : 'Recent Transactions'}</h3>
        {hasFilters ? (
          <button className="view-all" onClick={onClearFilters}>Clear Filters</button>
        ) : (
          <button className="view-all">View All</button>
        )}
      </div>
      <div className="transaction-list">
        {expenses.length === 0 ? (
          <div className="empty-state">
            {hasFilters ? "No transactions match your filters." : "No transactions yet. Add your first expense!"}
          </div>
        ) : (
          expenses.slice().reverse().map((exp, idx) => (
            <TransactionItem key={exp.id} exp={exp} idx={idx} />
          ))
        )}
      </div>
    </div>
  );
});
TransactionList.displayName = 'TransactionList';

// ─── Filter Bar ───
const FilterBar = React.memo(({ categoryFilter, setCategoryFilter, startDate, setStartDate, endDate, setEndDate, categories }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Category</label>
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
          className={categoryFilter !== 'All' ? 'has-value' : ''}
        >
          <option value="All">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>From</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={e => setStartDate(e.target.value)}
          className={startDate ? 'has-value' : ''} 
        />
      </div>
      <div className="filter-group">
        <label>To</label>
        <input 
          type="date" 
          value={endDate} 
          onChange={e => setEndDate(e.target.value)}
          className={endDate ? 'has-value' : ''} 
        />
      </div>
      {(categoryFilter !== 'All' || startDate || endDate) && (
        <button className="clear-filters" onClick={() => {
          setCategoryFilter('All');
          setStartDate('');
          setEndDate('');
        }}>Reset</button>
      )}
    </div>
  );
});
FilterBar.displayName = 'FilterBar';

// ─── Intelligence Engine (pure functions) ───
const getCategoryTotals = (expenses) =>
  expenses.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
    return acc;
  }, {});

const getMonthExpenses = (expenses, monthOffset = 0) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  return expenses.filter(ex => {
    if (!ex.date) return false;
    const parts = ex.date.split('-');
    if (parts.length < 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    return month === target.getMonth() && year === target.getFullYear();
  });
};

const getTrendLabel = (percent, diff) => {
  if (diff === 0) return 'No change from last month';
  const direction = diff > 0 ? 'increased' : 'decreased';
  const magnitude = Math.abs(percent);
  let feel;
  if (magnitude < 5) feel = 'slightly';
  else if (magnitude < 15) feel = 'noticeably';
  else if (magnitude < 30) feel = 'significantly';
  else feel = 'sharply';
  return `Spending ${direction} ${feel} (${Math.abs(percent).toFixed(1)}%)`;
};

const getFinancialHealthScore = (expenses, initialBalance = 24562) => {
  if (expenses.length === 0) return { score: 72, grade: 'B', label: 'Good Start', color: '#34d399', breakdown: { savings: 20, distribution: 52 } };
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catTotals = getCategoryTotals(expenses);

  // Savings Ratio Score (0-40 pts): higher savings = higher score
  const remaining = initialBalance - total;
  const savingsRatio = remaining / initialBalance;
  const savingsScore = Math.max(0, Math.min(40, Math.round(savingsRatio * 50)));

  // Spending Distribution Score (0-60 pts): penalise category over-concentration
  const sortedEntries = Object.values(catTotals).sort((a, b) => b - a);
  const top1Share = total > 0 ? sortedEntries[0] / total : 0;
  const essentials = ['Housing', 'Utilities', 'Transport'];
  const essentialSpend = essentials.reduce((s, c) => s + (catTotals[c] || 0), 0);
  const essentialRatio = total > 0 ? essentialSpend / total : 0;

  // Penalise if single category > 60% OR if food > 40%
  const food = (catTotals['Food & Drink'] || 0) + (catTotals['Food and Drink'] || 0);
  const foodRatio = total > 0 ? food / total : 0;
  let distScore = 60;
  if (top1Share > 0.7) distScore -= 20;
  else if (top1Share > 0.55) distScore -= 10;
  if (foodRatio > 0.4) distScore -= 15;
  else if (foodRatio > 0.25) distScore -= 7;
  if (essentialRatio > 0.85) distScore -= 10;
  distScore = Math.max(0, distScore);

  const score = Math.min(100, savingsScore + distScore);
  let grade, label, color;
  if (score >= 85) { grade = 'A'; label = 'Excellent'; color = '#34d399'; }
  else if (score >= 70) { grade = 'B'; label = 'Good'; color = '#818cf8'; }
  else if (score >= 55) { grade = 'C'; label = 'Fair'; color = '#fbbf24'; }
  else if (score >= 40) { grade = 'D'; label = 'Needs Work'; color = '#fb923c'; }
  else { grade = 'F'; label = 'At Risk'; color = '#fb7185'; }

  return { score, grade, label, color, breakdown: { savings: savingsScore, distribution: distScore } };
};

const getSmartRecommendations = (expenses, initialBalance = 24562) => {
  if (expenses.length === 0) return [{
    icon: '💡', title: 'Start Tracking', desc: 'Add your first expense to unlock personalized recommendations.', priority: 'low'
  }];

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catTotals = getCategoryTotals(expenses);
  const recs = [];

  const food = (catTotals['Food & Drink'] || 0) + (catTotals['Food and Drink'] || 0);
  if (total > 0 && food / total > 0.4)
    recs.push({ icon: '🍔', title: 'High Food Spending', desc: `Food & Drink is ${((food/total)*100).toFixed(0)}% of your budget. Try meal prepping — it can save ₹${Math.round(food * 0.3).toLocaleString()}/month.`, priority: 'high' });
  else if (total > 0 && food / total > 0.25)
    recs.push({ icon: '🍱', title: 'Moderate Food Costs', desc: `Food is ${((food/total)*100).toFixed(0)}% of spend. Cooking at home 2 more days a week could free up meaningful savings.`, priority: 'medium' });

  const entertainment = catTotals['Entertainment'] || 0;
  const shopping = catTotals['Shopping'] || 0;
  if (total > 0 && (entertainment + shopping) / total > 0.35)
    recs.push({ icon: '🛍️', title: 'Discretionary Spending High', desc: `Entertainment + Shopping = ${(((entertainment+shopping)/total)*100).toFixed(0)}% of budget. Apply the 24-hour rule before non-essential purchases.`, priority: 'high' });

  const remaining = initialBalance - total;
  const savingsRatio = remaining / initialBalance;
  if (savingsRatio < 0.1)
    recs.push({ icon: '🚨', title: 'Low Savings Alert', desc: `Only ${(savingsRatio*100).toFixed(1)}% of income remains. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`, priority: 'high' });
  else if (savingsRatio < 0.2)
    recs.push({ icon: '💰', title: 'Build Your Safety Net', desc: `You're saving ${(savingsRatio*100).toFixed(1)}%. Aim for at least 20% — even small increases compound over time.`, priority: 'medium' });

  const transport = catTotals['Transport'] || 0;
  if (total > 0 && transport / total > 0.2)
    recs.push({ icon: '🚗', title: 'Transport Costs Elevated', desc: `Transport is ${((transport/total)*100).toFixed(0)}% of spending. Carpooling or public transit could reduce this.`, priority: 'medium' });

  if (recs.length === 0)
    recs.push({ icon: '🎉', title: 'Great job!', desc: 'Your spending looks well-balanced. Keep it up and consider growing your investment portfolio.', priority: 'low' });

  return recs.sort((a, b) => { const p = {high:0,medium:1,low:2}; return p[a.priority] - p[b.priority]; });
};

// ─── Insights Panel (Enhanced) ───
const InsightsPanel = React.memo(({ expenses }) => {
  const insights = useMemo(() => {
    if (expenses.length === 0) return null;

    const catTotals = getCategoryTotals(expenses);
    if (Object.keys(catTotals).length === 0) return null;

    // Top 2 categories
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2);
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    // Monthly comparison
    const currMonthExp = getMonthExpenses(expenses, 0);
    const prevMonthExp = getMonthExpenses(expenses, 1);
    const currTotal = currMonthExp.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prevMonthExp.reduce((s, e) => s + e.amount, 0);
    const diff = currTotal - prevTotal;
    const percentChange = prevTotal !== 0 ? (diff / prevTotal) * 100 : (currTotal > 0 ? 100 : 0);
    const trendLabel = getTrendLabel(percentChange, diff);

    // Spending trend direction
    const trendDir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

    return { top2, total, trendLabel, trendDir, currTotal, prevTotal, diff: Math.abs(diff), percentChange };
  }, [expenses]);

  if (!insights) return (
    <div className="insights-container">
      <div className="insight-card highlight">
        <div className="insight-icon">📊</div>
        <div className="insight-details">
          <span className="insight-label">No Data Yet</span>
          <span className="insight-value">—</span>
          <span className="insight-subtext">Add expenses to see insights</span>
        </div>
      </div>
    </div>
  );

  const trendIcon = insights.trendDir === 'up' ? '📈' : insights.trendDir === 'down' ? '📉' : '➡️';

  return (
    <div className="insights-container">
      <div className="insight-card highlight">
        <div className="insight-icon">🥇</div>
        <div className="insight-details">
          <span className="insight-label">Top Category</span>
          <span className="insight-value">{insights.top2[0][0]}</span>
          <span className="insight-subtext">₹{insights.top2[0][1].toLocaleString()} · {((insights.top2[0][1]/insights.total)*100).toFixed(1)}% of spend</span>
        </div>
      </div>
      {insights.top2[1] && (
        <div className="insight-card">
          <div className="insight-icon">🥈</div>
          <div className="insight-details">
            <span className="insight-label">#2 Category</span>
            <span className="insight-value">{insights.top2[1][0]}</span>
            <span className="insight-subtext">₹{insights.top2[1][1].toLocaleString()} · {((insights.top2[1][1]/insights.total)*100).toFixed(1)}% of spend</span>
          </div>
        </div>
      )}
      <div className="insight-card">
        <div className="insight-icon">{trendIcon}</div>
        <div className="insight-details">
          <span className="insight-label">Monthly Trend</span>
          <span className="insight-value" style={{ color: insights.trendDir === 'up' ? 'var(--accent-error)' : insights.trendDir === 'down' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
            {insights.trendDir === 'flat' ? 'Stable' : (insights.trendDir === 'up' ? '+' : '-') + Math.abs(insights.percentChange).toFixed(1) + '%'}
          </span>
          <span className="insight-subtext">{insights.trendLabel}</span>
        </div>
      </div>
    </div>
  );
});
InsightsPanel.displayName = 'InsightsPanel';

// ─── Financial Health Score ───
const FinancialHealthScore = React.memo(({ expenses }) => {
  const health = useMemo(() => getFinancialHealthScore(expenses), [expenses]);
  const circumference = 2 * Math.PI * 40;
  const strokeDash = circumference - (health.score / 100) * circumference;

  return (
    <div className="health-score-card">
      <div className="health-score-header">
        <h3>💳 Financial Health Score</h3>
        <span className="health-grade" style={{ color: health.color }}>{health.grade}</span>
      </div>
      <div className="health-score-body">
        <div className="health-ring-wrap">
          <svg viewBox="0 0 100 100" className="health-ring">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={health.color} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="50" y="47" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="700">{health.score}</text>
            <text x="50" y="61" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">{health.label}</text>
          </svg>
        </div>
        <div className="health-breakdown">
          <div className="health-bar-item">
            <div className="health-bar-label">
              <span>Savings Ratio</span>
              <span style={{ color: health.color }}>{health.breakdown.savings}/40</span>
            </div>
            <div className="health-bar-bg">
              <div className="health-bar-fill" style={{ width: `${(health.breakdown.savings/40)*100}%`, background: health.color }} />
            </div>
          </div>
          <div className="health-bar-item">
            <div className="health-bar-label">
              <span>Spending Balance</span>
              <span style={{ color: health.color }}>{health.breakdown.distribution}/60</span>
            </div>
            <div className="health-bar-bg">
              <div className="health-bar-fill" style={{ width: `${(health.breakdown.distribution/60)*100}%`, background: health.color }} />
            </div>
          </div>
          <p className="health-tip">Score improves with balanced spending and higher savings.</p>
        </div>
      </div>
    </div>
  );
});
FinancialHealthScore.displayName = 'FinancialHealthScore';

// ─── Smart Recommendations ───
const SmartRecommendations = React.memo(({ expenses }) => {
  const recs = useMemo(() => getSmartRecommendations(expenses), [expenses]);
  const priorityStyle = { high: 'var(--accent-error)', medium: '#fbbf24', low: 'var(--accent-secondary)' };

  return (
    <div className="recommendations-panel">
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h3>🎯 Smart Recommendations</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Based on your data</span>
      </div>
      <div className="recommendations-list">
        {recs.map((rec, i) => (
          <div key={i} className="recommendation-item" style={{ borderLeft: `3px solid ${priorityStyle[rec.priority]}` }}>
            <div className="rec-icon">{rec.icon}</div>
            <div className="rec-content">
              <div className="rec-title">{rec.title}
                <span className="rec-badge" style={{ background: priorityStyle[rec.priority] }}>{rec.priority}</span>
              </div>
              <div className="rec-desc">{rec.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
SmartRecommendations.displayName = 'SmartRecommendations';

// ─── Chart Colors ───
const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#f472b6', '#22d3ee'];

// ─── Category Pie Chart ───
const CategorySpendingChart = React.memo(({ expenses }) => {
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
              contentStyle={{ backgroundColor: 'var(--bg-solid-secondary)', borderColor: 'var(--glass-border)', borderRadius: '10px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
CategorySpendingChart.displayName = 'CategorySpendingChart';

// ─── Monthly Bar Chart ───
const MonthlyExpensesChart = React.memo(({ expenses }) => {
  const data = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const monthlyTotals = expenses.reduce((acc, exp) => {
      if (!exp.date) return acc;
      const nums = String(exp.date).match(/\d+/g);
      if (!nums || nums.length < 2) return acc;

      let year, monthIdx;
      if (nums.length >= 3) {
        let yStr = nums[0];
        if (yStr.length > 4) yStr = yStr.slice(-4);
        year = parseInt(yStr, 10);
        monthIdx = parseInt(nums[1], 10) - 1;
      } else {
        year = parseInt(nums[0], 10);
        monthIdx = parseInt(nums[1], 10) - 1;
      }

      if (year < 100) year += 2000;
      if (year > 2100) year = new Date().getFullYear();

      const date = new Date(year, monthIdx, 1);
      if (isNaN(date.getTime())) return acc;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!acc[label]) {
        acc[label] = { label, total: 0, timestamp: date.getTime() };
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
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
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }}
              contentStyle={{ backgroundColor: 'var(--bg-solid-secondary)', borderColor: 'var(--glass-border)', borderRadius: '10px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Total']}
            />
            <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
MonthlyExpensesChart.displayName = 'MonthlyExpensesChart';

// ─── Chatbot ───
const Chatbot = React.memo(({ expenses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi! 👋 I'm your FinSight AI assistant. Ask me about your spending, or try one of the quick questions below!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const suggestions = useMemo(() => [
    "Where do I spend the most?",
    "What's my health score?",
    "How can I save money?",
    "Compare this month vs last"
  ], []);

  const generateResponse = useCallback((question) => {
    const q = question.toLowerCase();
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const catTotals = getCategoryTotals(expenses);
    const sortedCategories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
    const health = getFinancialHealthScore(expenses);
    const recs = getSmartRecommendations(expenses);

    // Monthly comparison
    const currMonthExp = getMonthExpenses(expenses, 0);
    const prevMonthExp = getMonthExpenses(expenses, 1);
    const currMonthTotal = currMonthExp.reduce((s, e) => s + e.amount, 0);
    const prevMonthTotal = prevMonthExp.reduce((s, e) => s + e.amount, 0);
    const monthDiff = currMonthTotal - prevMonthTotal;
    const monthPercent = prevMonthTotal !== 0 ? (monthDiff / prevMonthTotal) * 100 : 0;

    // Personality
    let personality = 'Smart Planner';
    if (expenses.length < 5) personality = 'Budget Rookie';
    else {
      const disc = expenses.filter(e => ['Entertainment', 'Shopping'].includes(e.category));
      const discRatio = disc.reduce((s, e) => s + e.amount, 0) / (total || 1);
      if (discRatio > 0.35) personality = 'Impulsive Spender';
      else {
        const ess = expenses.filter(e => ['Housing', 'Utilities', 'Transport'].includes(e.category));
        const essRatio = ess.reduce((s, e) => s + e.amount, 0) / (total || 1);
        if (essRatio > 0.5 && essRatio <= 0.8) personality = 'Balanced Saver';
        else {
          const food = expenses.filter(e => e.category === 'Food & Drink' || e.category === 'Food and Drink');
          if (food.reduce((s, e) => s + e.amount, 0) / (total || 1) > 0.25) personality = 'Foodie Enthusiast';
        }
      }
    }

    const greetings = [
      "Hey there! 👋 I'm ready to help you understand your finances better. Try asking about your spending!",
      "Hello! 😊 Your personal finance assistant is here. What would you like to know?",
      "Hi! 💬 Ask me about your spending, savings, or health score — I'm all ears!"
    ];
    const thanks = [
      "You're welcome! 😊 Happy to help you stay on top of your finances!",
      "Anytime! 🙌 Smart tracking leads to smarter saving.",
      "Glad I could help! 💡 Keep logging those expenses for better insights."
    ];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Greeting
    if (q.match(/^(hi|hey|hello|howdy|sup|yo)\b/))
      return pick(greetings);

    // Thank you
    if (q.includes('thank'))
      return pick(thanks);

    // "Where do I spend the most?" / "top categories"
    if (q.includes('spend the most') || q.includes('biggest expense') || q.includes('top spending') || q.includes('top categor') || q.includes('highest spending')) {
      if (expenses.length === 0) return "📭 You haven't added any expenses yet! Start tracking to get insights.";
      const breakdown = sortedCategories.slice(0, 3).map(([cat, amt], i) =>
        `${['🥇','🥈','🥉'][i]} **${cat}**: ₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${((amt/total)*100).toFixed(1)}%)`
      ).join('\n');
      return `📊 Your top spending category is **${topCategory[0]}** at **₹${topCategory[1].toLocaleString()}**\n\nFull breakdown:\n${breakdown}`;
    }

    // "How can I save money?"
    if (q.includes('save money') || q.includes('saving tips') || q.includes('reduce spending') || q.includes('cut costs') || q.includes('budget tip')) {
      if (expenses.length === 0) return "💡 Start by tracking your expenses here – that's step one to saving!";
      let tips = "💰 Personalised saving tips based on your data:\n\n";
      const food = (catTotals['Food & Drink'] || 0) + (catTotals['Food and Drink'] || 0);
      if (food / total > 0.25) tips += `🍔 **Food & Drink** is ${((food/total)*100).toFixed(0)}% of spending. Meal prepping could save ₹${Math.round(food*0.3).toLocaleString()}/month.\n\n`;
      if (catTotals['Entertainment'] && catTotals['Entertainment'] / total > 0.1) tips += `🎬 **Entertainment** is ${((catTotals['Entertainment']/total)*100).toFixed(0)}% — swap one outing/week for a free activity.\n\n`;
      if (catTotals['Shopping'] && catTotals['Shopping'] / total > 0.1) tips += `🛍️ **Shopping** is ${((catTotals['Shopping']/total)*100).toFixed(0)}% — use the 24-hour wait rule before purchases.\n\n`;
      tips += "📋 **Rule of thumb:** 50% needs • 30% wants • 20% savings.";
      return tips;
    }

    // "What's my total spending?"
    if (q.includes('total spending') || q.includes('total expenses') || q.includes('how much have i spent') || q.includes('how much did i spend')) {
      if (expenses.length === 0) return "📭 No expenses recorded yet. Start adding them!";
      const variations = [
        `💵 You've spent **₹${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}** across **${expenses.length}** transactions in **${sortedCategories.length}** categories.`,
        `📋 Total outflow: **₹${total.toLocaleString()}** from **${expenses.length}** recorded expenses across **${sortedCategories.length}** categories.`,
        `🧾 Your spending totals **₹${total.toLocaleString()}** — spread over **${expenses.length}** transactions.`
      ];
      return pick(variations);
    }

    // "My financial health score" / "health score"
    if (q.includes('health score') || q.includes('financial health') || q.includes('how healthy') || q.includes('my score')) {
      if (expenses.length === 0) return "📊 Add some expenses first so I can calculate your financial health score!";
      return `💳 Your **Financial Health Score** is **${health.score}/100** — Grade **${health.grade}** (${health.label}).\n\n• Savings score: ${health.breakdown.savings}/40\n• Distribution score: ${health.breakdown.distribution}/60\n\n${health.score >= 70 ? '✅ You\'re doing great!' : '⚠️ Check the Smart Recommendations panel for improvement tips.'}`;
    }

    // "What should I do?" / "recommendations"
    if (q.includes('recommend') || q.includes('what should') || q.includes('advice') || q.includes('suggest') || q.includes('tips')) {
      if (expenses.length === 0) return "💡 Start tracking expenses and I'll give you data-driven recommendations!";
      const topRec = recs[0];
      const others = recs.slice(1, 3).map(r => `• ${r.icon} **${r.title}**: ${r.desc}`).join('\n');
      return `🎯 Top recommendation for you:\n\n${topRec.icon} **${topRec.title}**: ${topRec.desc}\n\n${others.length > 0 ? 'Other tips:\n' + others : ''}`;
    }

    // "How was last month?" / "monthly comparison"
    if (q.includes('last month') || q.includes('this month') || q.includes('monthly') || q.includes('compare month')) {
      if (expenses.length === 0) return "📭 No expense data yet to compare months.";
      const arrow = monthDiff > 0 ? '📈 +' : monthDiff < 0 ? '📉 -' : '➡️ ';
      const changeText = monthDiff === 0 ? 'No change' : `${arrow}${Math.abs(monthPercent).toFixed(1)}% (₹${Math.abs(monthDiff).toLocaleString()})` ;
      return `📅 **This month**: ₹${currMonthTotal.toLocaleString()} across ${currMonthExp.length} transactions\n**Last month**: ₹${prevMonthTotal.toLocaleString()} across ${prevMonthExp.length} transactions\n\n${getTrendLabel(monthPercent, monthDiff)}. Change: ${changeText}`;
    }

    // Spending personality
    if (q.includes('personality') || q.includes('spending type') || q.includes('what kind of spender') || q.includes('spender am i'))
      return `🎭 Based on your patterns, you're a **${personality}**!\n\nThis is derived from the ratio of essential vs discretionary spending across all your recorded transactions.`;

    // Fallback
    const fallbacks = [
      `I can help with questions like:\n• "Where do I spend the most?"\n• "How can I save money?"\n• "What's my health score?"\n• "Compare this month vs last"\n• "Show my spending personality"`,
      `Ask me something like:\n• "What are my top categories?"\n• "Any savings tips?"\n• "What's my financial health?"\n• "How did last month compare?"`,
    ];
    return pick(fallbacks);
  }, [expenses]);

  const handleSend = useCallback((text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    setMessages(prev => [...prev, { type: 'user', text: msgText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(msgText);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, [input, generateResponse]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <button className={`chatbot-fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-avatar">🤖</div>
            <div className="chat-header-info">
              <h4>FinSight AI</h4>
              <p>Your personal finance assistant</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.type}`}>
                {msg.type === 'bot' ? (
                  msg.text.split('\n').map((line, k) => (
                    <span key={k}>
                      {line.split(/(\*\*.*?\*\*)/g).map((part, j) => (
                        part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
                      ))}
                      {k < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))
                ) : msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-typing">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="chat-suggestion-btn" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask about your finances..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" onClick={() => handleSend()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
});
Chatbot.displayName = 'Chatbot';

// ─── Dashboard ───
const Dashboard = React.memo(({
  expenses,
  filteredExpenses,
  onAddExpense,
  categoryFilter,
  setCategoryFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const initialBalance = 24562.00;
  const totalIncome = useMemo(() => expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const totalExpenses = useMemo(() => expenses.filter(e => e.type === 'expense' || !e.type).reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const currentBalance = useMemo(() => initialBalance + totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const balanceTrend = "3.2%";
  const expenseTrend = expenses.length > 0 ? "8.4%" : "0.0%";

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(ex => ex.category)));
  }, [expenses]);

  const hasFilters = useMemo(() => categoryFilter !== 'All' || startDate || endDate, [categoryFilter, startDate, endDate]);

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
  }, [setCategoryFilter, setStartDate, setEndDate]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== 'All') count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [categoryFilter, startDate, endDate]);

  return (
    <div className="content">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Overview Dashboard</h1>
          <p className="subtitle">Track and manage your financial health</p>
        </div>
        <button className="btn-primary" onClick={onAddExpense}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Expense
        </button>
      </div>

      <SpendingPersonalityTag expenses={filteredExpenses} />

      <div className="stats-grid">
        <StatCard
          title="Total Balance"
          value={`₹${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend={balanceTrend}
          isUp={true}
          color="var(--accent-color)"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend={expenseTrend}
          isUp={false}
          color="var(--accent-error)"
        />
        <StatCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          trend="12.5%"
          isUp={true}
          color="var(--accent-secondary)"
        />
      </div>

      <InsightsPanel expenses={filteredExpenses} />

      <div className="health-recs-grid">
        <FinancialHealthScore expenses={filteredExpenses} />
        <SmartRecommendations expenses={filteredExpenses} />
      </div>

      <div className="filter-section">
        <FilterBar
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          categories={categories}
        />
        {activeFilterCount > 0 && (
          <div className="filter-active-indicator">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </div>
        )}
      </div>

      {filteredExpenses.length > 0 && (
        <div className="charts-grid">
          <CategorySpendingChart expenses={filteredExpenses} />
          <MonthlyExpensesChart expenses={filteredExpenses} />
        </div>
      )}

      <TransactionList
        expenses={filteredExpenses}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
});
Dashboard.displayName = 'Dashboard';

// ─── App – routing shell ───
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      const matchesStartDate = !startDate || exp.date >= startDate;
      const matchesEndDate = !endDate || exp.date <= endDate;
      const matchesSearch = !searchQuery || 
        (exp.note && exp.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStartDate && matchesEndDate && matchesSearch;
    });
  }, [expenses, categoryFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please make sure the server is running.');
        addToast({ type: 'error', title: 'Fetch Error', message: 'Could not load your expenses.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [addToast]);

  const addExpense = useCallback(async (newExpense) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) throw new Error('Failed to save expense');
      const savedExpense = await response.json();
      setExpenses(prev => [...prev, savedExpense]);
      addToast({ type: 'success', title: 'Expense Added', message: `₹${savedExpense.amount} for ${savedExpense.category} saved successfully.` });
    } catch (err) {
      console.error('Error adding expense:', err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to save expense. Please try again.' });
      throw err;
    }
  }, [addToast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  const openModal = useCallback(() => {
    console.log('Opening modal');
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setIsModalOpen(false);
  }, []);

  // If not logged in and not on login page, redirect
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (!user && location.pathname !== '/login') return null;

  return (
    <div className="app-container">
      {user && location.pathname !== '/login' && <Sidebar onAddExpense={openModal} />}
      <div className={user && location.pathname !== '/login' ? "main-wrapper" : "login-wrapper"}>
        {user && location.pathname !== '/login' && (
          <Navbar
            theme={theme}
            onThemeToggle={toggleTheme}
            userName={user.name}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <Dashboard
              expenses={expenses}
              filteredExpenses={filteredExpenses}
              onAddExpense={openModal}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          } />
          <Route path="/insights" element={
            <InsightsPage 
              expenses={expenses}
              isLoading={isLoading}
              error={error}
            />
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {user && location.pathname !== '/login' && (
        <>
          <ExpenseModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onAdd={addExpense}
          />
          <Chatbot expenses={expenses} />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
      )}
    </div>
  );
}

export default App
