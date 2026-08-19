# Todo API (Containerized PostgreSQL & Redis) - Task A3

A containerized RESTful API for managing tasks, built with Node.js, Express, PostgreSQL, and Redis using Docker Compose. Storage is managed via a clean Repository Pattern, proving that changing storage implementation requires zero modifications to HTTP routes or business logic.

---

## 🏗️ Architecture & Storage Swapping (Repository Pattern)

This project strictly follows the **Repository Pattern**:
- **Interface Contract:** Standardized asynchronous methods (`findAll`, `findById`, `create`, `update`, `delete`).
- **Implementations:**
  - `InMemoryTaskRepository` (`src/repositories/inMemoryTaskRepository.js`): In-memory array fallback.
  - `PostgresTaskRepository` (`src/repositories/postgresTaskRepository.js`): Production-ready PostgreSQL storage using `pg.Pool`.
- **Selector:** `src/repositories/index.js` dynamically instantiates the appropriate repository based on `STORAGE_TYPE` (defaults to `postgres`).

### Honesty Statement on Architecture
> **Routes and HTTP logic in `server.js` remained 100% unchanged.**
> Replacing the direct database driver calls with `taskRepository` calls ensured that all API route definitions, input validations, status codes (`200`, `201`, `400`, `404`), and JSON response formats were preserved without modifying a single endpoint definition.

---

## 🚀 Stack

- **Runtime:** Node.js (v22 Alpine)
- **Framework:** Express 5
- **Database:** PostgreSQL 16 (in Docker with persistent named volume `postgres_data`)
- **Cache / Ping (Stretch):** Redis 7 (in Docker)
- **Orchestration:** Docker Compose
- **Config:** `dotenv` (`.env` gitignored, `.env.example` committed)

---

## 📁 Environment Variables

Environment variables are loaded from `.env` (which is excluded from Git via `.gitignore`). A template is provided in `.env.example`:

```env
PORT=3000
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=todos_db
POSTGRES_PORT=5434
DATABASE_URL=postgres://postgres:postgres@localhost:5434/todos_db
REDIS_URL=redis://localhost:6379
STORAGE_TYPE=postgres
```

> **Note on Docker networking:** Inside Docker Compose, the app container connects to PostgreSQL using the service name (`db:5432`). On the host machine, PostgreSQL is mapped to port `5434` to prevent local port conflicts.

---

## 🛠️ Running with Docker Compose

Start the complete application stack (PostgreSQL + Redis + Node App) with one command:

```bash
docker compose up -d --build
```

To stop the stack:

```bash
docker compose down
```

Check container status:

```bash
docker compose ps
```

---

## 🧪 Proof of Data Persistence Across Restarts

Data persistence is guaranteed by the named volume `postgres_data` mounted at `/var/lib/postgresql/data`.

### Verification Steps Performed:

1. **Started Stack:** Launched containers with `docker compose up -d`.
2. **Created a new task:**
   ```bash
   curl -X POST http://localhost:3000/api/todos \
     -H "Content-Type: application/json" \
     -d '{"title":"Probar persistencia en Docker Postgres"}'
   ```
   *Response:*
   ```json
   {
     "success": true,
     "data": {
       "id": 2,
       "title": "Probar persistencia en Docker Postgres",
       "done": false
     }
   }
   ```

3. **Restarted the Stack:**
   ```bash
   docker compose restart
   ```

4. **Verified Task Survival:**
   ```bash
   curl http://localhost:3000/api/todos
   ```
   *Response after restart:*
   ```json
   {
     "success": true,
     "count": 2,
     "data": [
       { "id": 1, "title": "Comprar leche", "done": false },
       { "id": 2, "title": "Probar persistencia en Docker Postgres", "done": false }
     ]
   }
   ```
   ✅ **Result:** The created task persisted across a complete container and application restart.

---

## 📡 API Endpoints & Interactive Documentation

Base URL: `http://localhost:3000`

Interactive OpenAPI / Swagger UI: [`http://localhost:3000/docs`](http://localhost:3000/docs)

| Method | Path                  | Auth Required | Description                          |
|--------|-----------------------|---------------|--------------------------------------|
| GET    | `/`                   | No            | Health check + storage engine status |
| GET    | `/docs`               | No            | Interactive Swagger UI documentation |
| POST   | `/auth/signup`        | No            | Register new user via Supabase       |
| POST   | `/auth/login`         | No            | Log in & obtain Bearer JWT tokens    |
| POST   | `/auth/logout`        | **Yes**       | Log out active Supabase session      |
| GET    | `/public/info`        | No            | Public welcome information           |
| GET    | `/protected/profile`  | **Yes**       | User profile (guarded by middleware) |
| GET    | `/protected/dashboard`| **Yes**       | User dashboard (guarded middleware)  |
| GET    | `/api/redis-ping`     | No            | Ping Redis cache (Stretch feature)   |
| GET    | `/api/todos`          | No            | List all tasks                       |
| GET    | `/api/todos/:id`      | No            | Get a single task by ID              |
| POST   | `/api/todos`          | No            | Create a task (201 / 400)            |
| PUT    | `/api/todos/:id`      | No            | Update a task (200 / 404 / 400)     |
| DELETE | `/api/todos/:id`      | No            | Delete a task (200 / 404)            |

### 🔒 Interactive Swagger UI (`/docs`)

Access [`http://localhost:3000/docs`](http://localhost:3000/docs) in your browser to test endpoints interactively. Protected routes (`/protected/*`, `/auth/logout`) feature a padlock icon and support Bearer JWT authorization.

![Swagger UI](docs/screenshots/swagger-ui.png)

---

## ⭐️ Stretch Features

### 1. Redis Integration & Ping Endpoint

Redis 7 runs as a service inside `docker-compose.yml`. The application connects using `ioredis` (`src/redisClient.js`).

Test endpoint:
```bash
curl http://localhost:3000/api/redis-ping
```
Response:
```json
{
  "success": true,
  "data": {
    "status": "up",
    "response": "PONG"
  }
}
```

### 2. PostgreSQL Index & EXPLAIN ANALYZE

An index was added to `init.sql` on the `done` boolean column:

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
```

#### EXPLAIN ANALYZE Execution Results:

1. **Default Sequential Scan (tiny dataset optimization):**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM tasks WHERE done = true;
   ```
   *Output:*
   ```text
   Seq Scan on tasks  (cost=0.00..1.01 rows=1 width=529) (actual time=0.005..0.005 rows=0 loops=1)
     Filter: done
     Rows Removed by Filter: 2
   Planning Time: 0.681 ms
   Execution Time: 0.038 ms
   ```

2. **Index Scan (Forced Index Scan on `idx_tasks_done`):**
   ```sql
   SET enable_seqscan = off;
   EXPLAIN ANALYZE SELECT * FROM tasks WHERE done = true;
   ```
   *Output:*
   ```text
   Index Scan using idx_tasks_done on tasks  (cost=0.12..8.14 rows=1 width=529) (actual time=0.029..0.029 rows=0 loops=1)
     Index Cond: (done = true)
   Planning Time: 0.648 ms
   Execution Time: 0.073 ms
   ```

---

## 📄 License

ISC