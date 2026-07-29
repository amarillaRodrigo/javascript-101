-- Database Initialization Script for Todo API (PostgreSQL)

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial tasks if table is empty
INSERT INTO tasks (title, done)
SELECT 'Comprar leche', false
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (title, done)
SELECT 'Estudiar Express + Postgres', false
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (title, done)
SELECT 'Hacer deploy con Docker Compose', true
WHERE NOT EXISTS (SELECT 1 FROM tasks);

-- Index for EXPLAIN ANALYZE stretch requirement
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
