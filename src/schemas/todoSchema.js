const { z } = require('zod');

const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
    .default(''),
  completed: z.boolean().optional().default(false),
});

const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
  completed: z.boolean().optional(),
});

module.exports = { createTodoSchema, updateTodoSchema };
