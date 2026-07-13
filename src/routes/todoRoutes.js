const express = require('express');
const { getAllTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todoController');
const validate = require('../middleware/validate');
const { createTodoSchema, updateTodoSchema } = require('../schemas/todoSchema');

const router = express.Router();

router.get('/', getAllTodos);
router.post('/', validate(createTodoSchema), createTodo);
router.put('/:id', validate(updateTodoSchema), updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
