require('dotenv').config();

require('./src/db');

const express = require('express');
const db = require('./src/db');

const app = express();
app.set('json spaces', 2);
app.use(express.json());

const PORT = process.env.PORT || 3000;

const toTask = (row) => ({
  id: row.id,
  title: row.title,
  done: Boolean(row.done),
});

app.get('/', (req, res) => {
  res.json({
    message: 'Todo API running on SQLite',
    db: process.env.DB_PATH || 'tasks.db',
  });
});

app.get('/api/todos', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY id').all();
  res.json({
    success: true,
    count: rows.length,
    data: rows.map(toTask),
  });
});

app.get('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  res.json({ success: true, data: toTask(row) });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});