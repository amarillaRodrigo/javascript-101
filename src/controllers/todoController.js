const Todo = require('../models/Todo');

const getAllTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({ success: true, count: todos.length, data: todos });
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    res.json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTodos, createTodo, updateTodo, deleteTodo };
