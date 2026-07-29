/**
 * In-Memory Task Repository implementation.
 * Implements the standard Repository interface for tasks.
 */
class InMemoryTaskRepository {
  constructor() {
    this.tasks = [
      { id: 1, title: 'Comprar leche', done: false },
      { id: 2, title: 'Estudiar Express + Postgres', done: false },
      { id: 3, title: 'Hacer deploy con Docker Compose', done: true },
    ];
    this.nextId = 4;
  }

  async findAll() {
    return this.tasks.map((task) => ({ ...task }));
  }

  async findById(id) {
    const task = this.tasks.find((t) => t.id === id);
    return task ? { ...task } : null;
  }

  async create({ title, done = false }) {
    const newTask = {
      id: this.nextId++,
      title: title.trim(),
      done: Boolean(done),
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, { title, done }) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    if (title !== undefined && title !== null) {
      this.tasks[index].title = title.trim();
    }
    if (done !== undefined && done !== null) {
      this.tasks[index].done = Boolean(done);
    }

    return { ...this.tasks[index] };
  }

  async delete(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    return true;
  }
}

module.exports = InMemoryTaskRepository;
