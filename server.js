require('dotenv').config();

const express = require('express');
const supabase = require('./src/supabaseClient');
const taskRepository = require('./src/repositories');
const { pingRedis } = require('./src/redisClient');


const requireAuth = require('./src/middleware/authMiddleware');

const app = express();
app.set('json spaces', 2);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Todo API running on PostgreSQL',
    storage: process.env.STORAGE_TYPE || 'postgres',
    database_url: process.env.DATABASE_URL ? '[CONFIGURED]' : '[LOCAL DEFAULT]',
  });
});

app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      user: data.user,
      data: data.user,
    });
  } catch (err) {
    console.error('Error in /auth/signup:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid login credentials',
      });
    }

    res.status(200).json({
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    console.error('Error in /auth/login:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error in /auth/logout:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.get('/public/info', (req, res) => {
  res.status(200).json({
    message: 'Welcome stranger! This info is public.',
  });
});

app.get('/protected/profile', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Welcome to your protected profile!',
    user: req.user,
  });
});

app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Welcome to your dashboard!',
    user: req.user,
  });
});

app.get('/api/redis-ping', async (req, res) => {
  const result = await pingRedis();
  res.json({
    success: result.status === 'up',
    data: result,
  });
});

app.get('/api/todos', async (req, res) => {
  try {
    const tasks = await taskRepository.findAll();
    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

app.get('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  try {
    const task = await taskRepository.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task by id:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

app.post('/api/todos', async (req, res) => {
  const { title, done } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ success: false, error: 'Done must be a boolean' });
  }

  try {
    const newTask = await taskRepository.create({ title, done });
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Database insertion failed' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
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

  try {
    const updatedTask = await taskRepository.update(id, { title, done });
    if (!updatedTask) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Database update failed' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  try {
    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Database deletion failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} and connected to Supabase`);
});

