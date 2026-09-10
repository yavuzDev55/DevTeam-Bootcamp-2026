import prisma from '../../db/prisma.js';

const selectFields = {
  id: true,
  title: true,
  description: true,
  completed: true,
  priority: true,
  userId: true,
  createdAt: true,
};

export const selectAllTodos = async (filters = {}) => {
  const where = {};

  if (typeof filters.completed === 'boolean') {
    where.completed = filters.completed;
  }

  if (typeof filters.q === 'string' && filters.q.trim() !== '') {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }

  return await prisma.todo.findMany({
    where,
    select: selectFields,
    orderBy: { createdAt: 'desc' },
  });
};

export const selectTodoById = async (id) => {
  return await prisma.todo.findUnique({
    where: { id },
    select: selectFields,
  });
};

export const selectTodosByUserId = async (userId) => {
  return await prisma.todo.findMany({
    where: { userId },
    select: selectFields,
    orderBy: { createdAt: 'desc' },
  });
};

export const insertTodo = async (todoData) => {
  const { title, description, priority, userId } = todoData;

  const data = {
    title,
    description: description ?? null,
    userId: userId ?? null,
  };

  if (Number.isInteger(priority)) {
    data.priority = priority;
  }

  return await prisma.todo.create({
    data,
    select: selectFields,
  });
};

export const updateTodo = async (id, fields) => {
  const data = {};
  if (fields.title !== undefined) data.title = fields.title;
  if (fields.description !== undefined) data.description = fields.description;
  if (fields.completed !== undefined) data.completed = fields.completed;
  if (Number.isInteger(fields.priority)) data.priority = fields.priority;

  const { count } = await prisma.todo.updateMany({
    where: { id },
    data,
  });

  if (count === 0) return undefined;
  return await selectTodoById(id);
};

export const deleteTodo = async (id) => {
  const existing = await selectTodoById(id);
  if (!existing) return undefined;

  const { count } = await prisma.todo.deleteMany({
    where: { id },
  });

  if (count === 0) return undefined;
  return existing;
};

export const selectTodoTags = async (todoId) => {
  const rows = await prisma.todoTag.findMany({
    where: { todoId },
    select: { tag: { select: { id: true, name: true } } },
    orderBy: { tag: { name: 'asc' } },
  });
  return rows.map((row) => row.tag);
};

export const insertTodoTag = async (todoId, tagId) => {
  const existingRelation = await prisma.todoTag.findUnique({
    where: {
      todoId_tagId: { todoId, tagId },
    },
  });

  if (existingRelation) return null;

  return await prisma.todoTag.create({
    data: { todoId, tagId },
  });
};

export const deleteTodoTag = async (todoId, tagId) => {
  const { count } = await prisma.todoTag.deleteMany({
    where: { todoId, tagId },
  });

  if (count === 0) return undefined;
  return true;
};