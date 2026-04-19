import React, { useMemo, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#f472b6', '#22d3ee'];

const InsightsPage = ({ expenses, isLoading, error }) => {
  // Debug log for data flow
  useEffect(() => {
    console.log('Insights Page Data:', { expensesCount: expenses.length, isLoading, error });
  }, [expenses, isLoading, error]);

  // Comprehensive Calculations
  const metrics = useMemo(() => {
    if (!expenses.length) return null;

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expenses
      .filter(e => e.type === 'expense' || !e.type)
      .reduce((sum, e) => sum + e.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category Breakdown (Expenses only)
    const categoryTotals = expenses
      .filter(e => e.type === 'expense' || !e.type)
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Monthly Trends
    const monthlyDataMap = expenses.reduce((acc, exp) => {
      const date = new Date(exp.date);
      if (isNaN(date.getTime())) return acc;
      
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      const monthSortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthLabel]) {
        acc[monthLabel] = { name: monthLabel, income: 0, expenses: 0, sortKey: monthSortKey };
      }

      if (exp.type === 'income') {
        acc[monthLabel].income += exp.amount;
      } else {
        acc[monthLabel].expenses += exp.amount;
      }
      return acc;
    }, {});

    const monthlyData = Object.values(monthlyDataMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ name, income, expenses }) => ({ name, income, expenses }));

    return { totalIncome, totalExpenses, netSavings, savingsRate, categoryData, monthlyData };
  }, [expenses]);

  if (isLoading) {
    return (
      <div className="content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Analyzing your financial trends...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="error-state animate-reveal" style={{ textAlign: 'center', padding: '100px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: 'var(--accent-error)', marginBottom: '10px' }}>Oops! Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics || expenses.length === 0) {
    return (
      <div className="content">
        <div className="empty-state animate-reveal" style={{ textAlign: 'center', padding: '100px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
          <h2 style={{ marginBottom: '12px' }}>No insights available yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '15px' }}>
            We need more data to generate insights. Start by adding your transactions to see detailed financial analytics.
          </p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="content insights-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="header-text">
          <h1>Financial Insights</h1>
          <p className="subtitle">Deep dive into your spending and saving patterns</p>
        </div>
      </motion.div>

      <motion.div className="stats-grid" variants={itemVariants}>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-secondary)' }}>
          <div className="stat-label">Total Income</div>
          <div className="stat-value">₹{metrics.totalIncome.toLocaleString()}</div>
          <div className="stat-trend trend-up">Monthly earnings target met</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-error)' }}>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">₹{metrics.totalExpenses.toLocaleString()}</div>
          <div className="stat-trend trend-down">Total outflow recorded</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-color)' }}>
          <div className="stat-label">Net Savings</div>
          <div className="stat-value">₹{metrics.netSavings.toLocaleString()}</div>
          <div className="stat-trend" style={{ color: metrics.netSavings >= 0 ? 'var(--accent-secondary)' : 'var(--accent-error)' }}>
            {metrics.savingsRate.toFixed(1)}% savings rate
          </div>
        </div>
      </motion.div>

      <div className="charts-grid">
        <motion.div className="chart-container full-width premium-card" variants={itemVariants}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Income vs Expenses Trend</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '12px' }}>
              Last {metrics.monthlyData.length} Months
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={metrics.monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-error)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent-error)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-solid-secondary)', 
                    borderColor: 'var(--glass-border)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  labelStyle={{ marginBottom: '8px', opacity: 0.7 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--accent-secondary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  name="Income"
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="var(--accent-error)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  name="Expenses"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="chart-container premium-card" variants={itemVariants}>
          <h3>Expense Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={90}
                  paddingAngle={8} dataKey="value"
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {metrics.categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-solid-secondary)', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="chart-container premium-card" variants={itemVariants}>
          <h3>Savings Velocity</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-solid-secondary)', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={(d) => d.income - d.expenses} 
                  stroke="var(--accent-color)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                  name="Net Savings"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InsightsPage;
