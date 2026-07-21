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

app.post('/api/todos', (req, res) => {
  const { title, done } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ success: false, error: 'Done must be a boolean' });
  }

  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insert.run(title.trim(), done ? 1 : 0);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: toTask(row) });
});

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const { title, done } = req.body ?? {};

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ success: false, error: 'Title cannot be empty' });
  }

  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ success: false, error: 'Done must be a boolean' });
  }

  const result = db
    .prepare(
      'UPDATE tasks SET title = COALESCE(?, title), done = COALESCE(?, done) WHERE id = ?'
    )
    .run(
      title !== undefined ? title.trim() : null,
      done !== undefined ? (done ? 1 : 0) : null,
      id
    );

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ success: true, data: toTask(row) });
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  res.json({ success: true, data: {} });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



