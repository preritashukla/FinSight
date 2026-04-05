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

// GET /api/expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const data = await readFile(DB_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses
app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = req.body;
    
    // Simple validation
    if (!newExpense.amount || !newExpense.category) {
      return res.status(400).json({ error: 'Amount and category are required' });
    }

    const data = await readFile(DB_PATH, 'utf-8');
    const expenses = JSON.parse(data);
    
    // Add ID if not present
    if (!newExpense.id) {
      newExpense.id = Date.now();
    }
    
    expenses.push(newExpense);
    await writeFile(DB_PATH, JSON.stringify(expenses, null, 2));
    
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error saving expense:', error);
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
