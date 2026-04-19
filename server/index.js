import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'expenses.json');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper: read all expenses from JSON file
const readExpenses = async () => {
  const data = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

// Helper: write all expenses to JSON file
const writeExpenses = async (expenses) => {
  await writeFile(DB_PATH, JSON.stringify(expenses, null, 2));
};

// GET /api/expenses – fetch all expenses
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

    // Validation
    if (!newExpense.amount || isNaN(Number(newExpense.amount))) {
      return res.status(400).json({ error: 'A valid numeric amount is required' });
    }
    if (!newExpense.category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Ensure numeric amount
    newExpense.amount = parseFloat(newExpense.amount);

    // Auto-assign ID if missing
    if (!newExpense.id) {
      newExpense.id = Date.now();
    }

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

// 404 handler for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`✅ FinSight server running at http://localhost:${PORT}`);
});
