import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

// ─── Theme Toggle ───
const ThemeToggle = ({ theme, onToggle }) => (
  <div className="theme-toggle" onClick={onToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
    <div className={`theme-toggle-knob ${theme === 'light' ? 'light' : ''}`}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </div>
  </div>
);

// ─── Sidebar ───
const Sidebar = ({ onAddExpense }) => {
  const navItems = [
    { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Add Expense', icon: 'M12 4v16m8-8H4', onClick: onAddExpense },
    { name: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

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
        {navItems.map((item, index) => (
          <div
            key={item.name}
            className={`nav-item ${index === 0 ? 'active' : ''}`}
            onClick={item.onClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Navbar ───
const Navbar = ({ theme, onThemeToggle }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-search">
          🔍 Search transactions, reports...
        </div>
      </div>
      <div className="navbar-right">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="user-profile">
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Welcome, <strong style={{ color: 'var(--text-primary)' }}>Alex</strong>
          </span>
          <div className="avatar"></div>
        </div>
      </div>
    </nav>
  );
};

// ─── Stat Card ───
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

const SpendingPersonalityTag = ({ expenses }) => {
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
};

// ─── Expense Modal ───
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
            <label>Amount (₹)</label>
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

// ─── Transaction List ───
const TransactionList = ({ expenses, onClearFilters, hasFilters }) => {
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
            <div key={exp.id} className="transaction-item" style={{ animationDelay: `${idx * 0.05}s` }}>
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
          ))
        )}
      </div>
    </div>
  );
};

// ─── Filter Bar ───
const FilterBar = ({ categoryFilter, setCategoryFilter, startDate, setStartDate, endDate, setEndDate, categories }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Category</label>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label>From</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div className="filter-group">
        <label>To</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
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
};

// ─── Insights Panel ───
const InsightsPanel = ({ expenses }) => {
  const insights = useMemo(() => {
    if (expenses.length === 0) return null;

    const catTotals = expenses.reduce((acc, ex) => {
      acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
      return acc;
    }, {});

    if (Object.keys(catTotals).length === 0) return null;

    const highest = Object.entries(catTotals).reduce((a, b) => a[1] > b[1] ? a : b);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currMonthTotal = expenses
      .filter(ex => {
        const d = new Date(ex.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, ex) => sum + ex.amount, 0);

    const prevMonthTotal = expenses
      .filter(ex => {
        const d = new Date(ex.date);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, ex) => sum + ex.amount, 0);

    const diff = currMonthTotal - prevMonthTotal;
    const percentChange = prevMonthTotal !== 0 ? (diff / prevMonthTotal) * 100 : 0;

    return {
      highest: { name: highest[0], amount: highest[1] },
      trend: { percent: Math.abs(percentChange).toFixed(1), isUp: diff > 0, diff: Math.abs(diff) }
    };
  }, [expenses]);

  if (!insights) return null;

  return (
    <div className="insights-container">
      <div className="insight-card highlight">
        <div className="insight-icon">🔥</div>
        <div className="insight-details">
          <span className="insight-label">Top Spending</span>
          <span className="insight-value">{insights.highest.name}</span>
          <span className="insight-subtext">₹{insights.highest.amount.toLocaleString()} total</span>
        </div>
      </div>
      <div className="insight-card">
        <div className="insight-icon">{insights.trend.isUp ? '📈' : '📉'}</div>
        <div className="insight-details">
          <span className="insight-label">Monthly Trend</span>
          <span className="insight-value">{insights.trend.isUp ? '+' : '-'}{insights.trend.percent}%</span>
          <span className="insight-subtext">₹{insights.trend.diff.toLocaleString()} vs last month</span>
        </div>
      </div>
    </div>
  );
};

// ─── Chart Colors ───
const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#f472b6', '#22d3ee'];

// ─── Category Pie Chart ───
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
              contentStyle={{ backgroundColor: 'var(--bg-solid-secondary)', borderColor: 'var(--glass-border)', borderRadius: '10px' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Monthly Bar Chart ───
const MonthlyExpensesChart = ({ expenses }) => {
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
};

// ─── Chatbot ───
const Chatbot = ({ expenses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi! 👋 I'm your FinSight AI assistant. Ask me about your spending, or try one of the quick questions below!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestions = [
    "Where do I spend the most?",
    "How can I save money?",
    "What's my total spending?",
    "Show my spending personality"
  ];

  const generateResponse = (question) => {
    const q = question.toLowerCase();
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const catTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const sortedCategories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

    // Spending Personality
    let personality = 'Smart Planner';
    if (expenses.length < 5) {
      personality = 'Budget Rookie';
    } else {
      const discretionary = expenses.filter(e => ['Entertainment', 'Shopping'].includes(e.category));
      const discretionaryRatio = discretionary.reduce((s, e) => s + e.amount, 0) / (total || 1);
      if (discretionaryRatio > 0.35) personality = 'Impulsive Spender';
      else {
        const essentials = expenses.filter(e => ['Housing', 'Utilities', 'Transport'].includes(e.category));
        const essentialRatio = essentials.reduce((s, e) => s + e.amount, 0) / (total || 1);
        if (essentialRatio > 0.5 && essentialRatio <= 0.8) personality = 'Balanced Saver';
        else {
          const food = expenses.filter(e => e.category === 'Food & Drink' || e.category === 'Food and Drink');
          if (food.reduce((s, e) => s + e.amount, 0) / (total || 1) > 0.25) personality = 'Foodie Enthusiast';
        }
      }
    }

    // "Where do I spend the most?"
    if (q.includes('spend the most') || q.includes('biggest expense') || q.includes('top spending') || q.includes('highest spending')) {
      if (expenses.length === 0) return "You haven't added any expenses yet! Start tracking to get insights.";
      const breakdown = sortedCategories.slice(0, 3).map(([cat, amt]) =>
        `• **${cat}**: ₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ).join('\n');
      return `📊 Your top spending category is **${topCategory[0]}** at **₹${topCategory[1].toLocaleString(undefined, { minimumFractionDigits: 2 })}** (${((topCategory[1] / total) * 100).toFixed(1)}% of total).\n\nHere's your top 3:\n${breakdown}`;
    }

    // "How can I save money?"
    if (q.includes('save money') || q.includes('saving tips') || q.includes('reduce spending') || q.includes('cut costs')) {
      if (expenses.length === 0) return "Start by tracking your expenses here – that's the first step to saving! 💡";
      let tips = "💰 Here are personalized saving tips based on your data:\n\n";

      if (catTotals['Entertainment'] && catTotals['Entertainment'] / total > 0.1)
        tips += "🎬 **Entertainment** makes up " + ((catTotals['Entertainment'] / total) * 100).toFixed(0) + "% of spending. Try free alternatives like movie nights at home.\n\n";
      if (catTotals['Shopping'] && catTotals['Shopping'] / total > 0.1)
        tips += "🛍️ **Shopping** is " + ((catTotals['Shopping'] / total) * 100).toFixed(0) + "% of your budget. Try a 24-hour wait rule before purchases.\n\n";
      if ((catTotals['Food & Drink'] || catTotals['Food and Drink'])) {
        const foodTotal = (catTotals['Food & Drink'] || 0) + (catTotals['Food and Drink'] || 0);
        if (foodTotal / total > 0.15)
          tips += "🍔 **Food & Drink** is " + ((foodTotal / total) * 100).toFixed(0) + "% of spending. Meal prepping could save you ₹" + (foodTotal * 0.3).toFixed(0) + "/month.\n\n";
      }
      tips += "📋 **General tip:** Follow the 50/30/20 rule – 50% needs, 30% wants, 20% savings.";
      return tips;
    }

    // "What's my total spending?"
    if (q.includes('total spending') || q.includes('total expenses') || q.includes('how much have i spent')) {
      if (expenses.length === 0) return "No expenses recorded yet. Start adding them!";
      return `💵 Your total spending is **₹${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}** across **${expenses.length}** transactions in **${Object.keys(catTotals).length}** categories.`;
    }

    // "Show my spending personality"
    if (q.includes('personality') || q.includes('spending type') || q.includes('what kind of spender')) {
      return `🎭 Based on your spending patterns, your personality tag is: **${personality}**!\n\nThis is calculated from the ratio of essential vs discretionary spending in your expense history.`;
    }

    // "Hello" / greeting
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return "Hey there! 👋 I'm ready to help you understand your finances better. Try asking me about your spending patterns!";
    }

    // "Thank you"
    if (q.includes('thank')) {
      return "You're welcome! 😊 Happy to help you stay on top of your finances!";
    }

    // Fallback
    return `I can help with questions like:\n• "Where do I spend the most?"\n• "How can I save money?"\n• "What's my total spending?"\n• "Show my spending personality"\n\nTry one of those!`;
  };

  const formatMessage = (text) => {
    // Simple markdown-like bold
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <React.Fragment key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</React.Fragment>;
    });
  };

  const handleSend = (text) => {
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
  };

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
                {msg.type === 'bot' ? formatMessage(msg.text) : msg.text}
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
};

// ─── Dashboard ───
const Dashboard = ({
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
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentBalance = initialBalance - totalExpenses;

  const balanceTrend = "3.2%";
  const expenseTrend = expenses.length > 0 ? "8.4%" : "0.0%";

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(ex => ex.category)));
  }, [expenses]);

  const hasFilters = categoryFilter !== 'All' || startDate || endDate;

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

      <SpendingPersonalityTag expenses={expenses} />

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
          title="Monthly Savings"
          value="₹8,450.00"
          trend="5.1%"
          isUp={true}
          color="var(--accent-secondary)"
        />
      </div>

      <InsightsPanel expenses={expenses} />

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
        onClearFilters={() => {
          setCategoryFilter('All');
          setStartDate('');
          setEndDate('');
        }}
      />
    </div>
  );
};

// ─── App ───
function App() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      const matchesStartDate = !startDate || new Date(exp.date) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(exp.date) <= new Date(endDate);
      return matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [expenses, categoryFilter, startDate, endDate]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const addExpense = async (newExpense) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) throw new Error('Failed to save expense');

      const savedExpense = await response.json();
      setExpenses(prev => [...prev, savedExpense]);
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to save expense. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar onAddExpense={() => setIsModalOpen(true)} />
      <div className="main-wrapper">
        <Navbar theme={theme} onThemeToggle={toggleTheme} />
        {isLoading ? (
          <div className="content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading your financial data...</div>
            </div>
          </div>
        ) : error ? (
          <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ color: 'var(--accent-error)', marginBottom: '1rem', fontSize: '16px' }}>{error}</div>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <Dashboard
            expenses={expenses}
            filteredExpenses={filteredExpenses}
            onAddExpense={() => setIsModalOpen(true)}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        )}
      </div>
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addExpense}
      />
      <Chatbot expenses={expenses} />
    </div>
  )
}

export default App
