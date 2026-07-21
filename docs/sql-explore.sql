-- Stage 4: SQL exploration script
-- File: docs/sql-explore.sql
-- Open tasks.db with DB Browser for SQLite (or the SQLite Viewer VS Code
-- extension) and run the queries below to inspect and mutate the table by
-- hand. Each change is immediately reflected by GET /api/todos because
-- the Express server reads from the same tasks.db file on every request.

-- 1. List every task.
SELECT * FROM tasks;

-- 2. Show only completed tasks (done is stored as INTEGER 0/1 in SQLite).
SELECT * FROM tasks WHERE done = 1;

-- 3. Count all tasks.
SELECT COUNT(*) FROM tasks;

-- 4. Mark every task as completed.
UPDATE tasks SET done = 1;

-- 5. Delete every completed task. Run query #4 first if you want to keep
--    the table empty after running this script end-to-end.
DELETE FROM tasks WHERE done = 1;