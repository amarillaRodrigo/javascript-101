require('dotenv').config();

require('./src/db');

const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Todo API running on SQLite',
    db: process.env.DB_PATH || 'tasks.db',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

