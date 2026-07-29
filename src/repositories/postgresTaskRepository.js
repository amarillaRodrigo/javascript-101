const { Pool } = require('pg');

/**
 * PostgreSQL Task Repository implementation.
 * Connects to Postgres using environment variables / connection string.
 */
class PostgresTaskRepository {
  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'todos_db'}`;

    this.pool = new Pool({
      connectionString,
    });

    this.pool.on('error', (err) => {
      console.error('[PostgresPool] Unexpected error on idle client', err);
    });
  }

  toTask(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      done: Boolean(row.done),
    };
  }

  async findAll() {
    const { rows } = await this.pool.query(
      'SELECT id, title, done FROM tasks ORDER BY id ASC'
    );
    return rows.map((row) => this.toTask(row));
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, title, done FROM tasks WHERE id = $1',
      [id]
    );
    return rows.length > 0 ? this.toTask(rows[0]) : null;
  }

  async create({ title, done = false }) {
    const { rows } = await this.pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id, title, done',
      [title.trim(), Boolean(done)]
    );
    return this.toTask(rows[0]);
  }

  async update(id, { title, done }) {
    const { rows } = await this.pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING id, title, done',
      [
        title !== undefined && title !== null ? title.trim() : null,
        done !== undefined && done !== null ? Boolean(done) : null,
        id,
      ]
    );
    return rows.length > 0 ? this.toTask(rows[0]) : null;
  }

  async delete(id) {
    const { rowCount } = await this.pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = PostgresTaskRepository;
