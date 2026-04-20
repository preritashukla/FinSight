import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';
import Groq from 'groq-sdk';
dotenvConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'expenses.json');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory cache for expenses to avoid repetitive disk I/O
let expensesCache = null;

// Helper: read all expenses from JSON file
const readExpenses = async () => {
  if (expensesCache) return expensesCache;
  try {
    const data = await readFile(DB_PATH, 'utf-8');
    expensesCache = JSON.parse(data);
    return expensesCache;
  } catch (error) {
    if (error.code === 'ENOENT') {
      expensesCache = [];
      return expensesCache;
    }
    throw error;
  }
};

// Helper: write all expenses to JSON file and update cache
const writeExpenses = async (expenses) => {
  await writeFile(DB_PATH, JSON.stringify(expenses, null, 2));
  expensesCache = expenses;
};

// GET /api/expenses – fetch all expenses (served from cache if available)
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await readExpenses();
    res.json(expenses);
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses – add a new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = req.body;

    if (!newExpense.amount || isNaN(Number(newExpense.amount))) {
      return res.status(400).json({ error: 'A valid numeric amount is required' });
    }
    if (!newExpense.category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!newExpense.type) newExpense.type = 'expense';
    newExpense.amount = parseFloat(newExpense.amount);
    if (!newExpense.id) newExpense.id = Date.now();

    const expenses = await readExpenses();
    expenses.push(newExpense);
    await writeExpenses(expenses);

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error saving expense:', error);
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// DELETE /api/expenses/:id – remove an expense by id
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const expenses = await readExpenses();
    const filtered = expenses.filter((e) => e.id !== id);

    if (filtered.length === expenses.length) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await writeExpenses(filtered);
    res.json({ message: 'Expense deleted', id });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// POST /api/chat – AI-powered finance assistant using Groq
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return res.status(503).json({
        error: '⚠️ Groq API key not configured. Please add GROQ_API_KEY to your .env file.',
      });
    }

    const { message, expenses } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Build rich financial context from expense data
    const total = (expenses || []).reduce((s, e) => s + e.amount, 0);
    const catTotals = (expenses || []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    const now = new Date();
    const currMonthExp = (expenses || []).filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const prevMonthExp = (expenses || []).filter(e => {
      const d = new Date(e.date);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });

    const financialContext =
      expenses && expenses.length > 0
        ? `USER'S FINANCIAL DATA:
- Total transactions: ${expenses.length}
- Total spent: ₹${total.toFixed(2)}
- Category breakdown: ${sortedCats.map(([c, a]) => `${c}: ₹${a.toFixed(2)} (${((a / total) * 100).toFixed(1)}%)`).join(', ')}
- This month: ₹${currMonthExp.reduce((s, e) => s + e.amount, 0).toFixed(2)} (${currMonthExp.length} transactions)
- Last month: ₹${prevMonthExp.reduce((s, e) => s + e.amount, 0).toFixed(2)} (${prevMonthExp.length} transactions)
- Recent 5 transactions: ${expenses
            .slice(-5)
            .map(e => `[${e.date}] ${e.category} ₹${e.amount}${e.note ? ' – ' + e.note : ''}`)
            .join(' | ')}`
        : 'USER HAS NO EXPENSE DATA YET.';

    const systemPrompt = `You are FinSight AI, a friendly and intelligent personal finance assistant inside the FinSight expense tracking app.

RULES:
- Only answer questions related to personal finance, budgeting, expenses, savings, and investments.
- If asked anything unrelated (poems, shayari, coding, weather, general knowledge, etc.), politely say you can't help with that and suggest a finance question instead.
- Be concise, warm, and use relevant emojis.
- Use Indian Rupees (₹) for all amounts.
- Give data-driven, specific answers when the user has expense data.
- Keep responses under 200 words unless a detailed breakdown is explicitly requested.

${financialContext}`;

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '❌ No response from AI.';
    res.json({ reply: responseText });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: '❌ AI assistant is temporarily unavailable. Please try again shortly.' });
  }
});

// 404 handler for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, async () => {
  console.log(`✅ FinSight server running at http://localhost:${PORT}`);
  try {
    await readExpenses();
    console.log('📦 Expenses cache pre-loaded');
  } catch (err) {
    console.error('⚠️ Failed to pre-load expenses cache:', err.message);
  }
});
