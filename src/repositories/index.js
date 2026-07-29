const InMemoryTaskRepository = require('./inMemoryTaskRepository');
const PostgresTaskRepository = require('./postgresTaskRepository');

const storageType = (process.env.STORAGE_TYPE || 'postgres').toLowerCase();

let taskRepository;

if (storageType === 'in-memory') {
  console.log('[Storage] Initialized In-Memory Task Repository');
  taskRepository = new InMemoryTaskRepository();
} else {
  console.log('[Storage] Initialized PostgreSQL Task Repository');
  taskRepository = new PostgresTaskRepository();
}

module.exports = taskRepository;
