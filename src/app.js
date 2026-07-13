const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Todo API' });
});

app.use(errorHandler);

module.exports = app;
