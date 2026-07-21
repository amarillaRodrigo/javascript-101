const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '..', 'tasks.db');

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );
`);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const seeds = [
    { title: 'Comprar leche', done: 0 },
    { title: 'Estudiar Express + SQLite', done: 0 },
    { title: 'Hacer deploy en Render', done: 1 },
  ];
  for (const row of seeds) insert.run(row.title, row.done);
  console.log('[db] Seeded 3 example tasks into', dbPath);
} else {
  console.log(`[db] tasks.db already has ${count} row(s), skipping seed`);
}

module.exports = db;