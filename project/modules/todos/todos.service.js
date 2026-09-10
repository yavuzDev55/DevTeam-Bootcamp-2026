import * as todosDb from './todos.db.js';
import { getTagById } from '../tags/tags.service.js';
import { getUserById } from '../users/users.service.js';

export const getTodos = async (query = {}) => {
  const { completed, q } = query;
  const filters = {};

  if (completed === "true" || completed === "false") {
    filters.completed = completed === "true";
  }

  if (typeof q === "string" && q.trim() !== "") {
    filters.q = q.trim();
  }

  return await todosDb.selectAllTodos(filters);
};

export const addTodo = async (todoData) => {
  if (todoData.userId) {
    const user = await getUserById(todoData.userId);
    if (!user) {
      return { status: 'USER_NOT_FOUND' };
    }
  }

  const todo = await todosDb.insertTodo(todoData);
  return { status: 'SUCCESS', todo };
};

export const replaceTodo = async (id, fields) => {
  return await todosDb.updateTodo(id, fields);
};

export const updateTodo = async (id, fields) => {
  return await todosDb.updateTodo(id, fields);
};

export const deleteTodo = async (id) => {
  return await todosDb.deleteTodo(id);
};

export const getTodoById = async (id) => {
  return await todosDb.selectTodoById(id);
};

export const getTodosByUserId = async (userId) => {
  return await todosDb.selectTodosByUserId(userId);
};

export const addTagToTodo = async (todoId, tagId) => {
  const todo = await todosDb.selectTodoById(todoId);
  if (!todo) {
    return { status: 'TODO_NOT_FOUND' };
  }

  const tag = await getTagById(tagId);
  if (!tag) {
    return { status: 'TAG_NOT_FOUND' };
  }

  const result = await todosDb.insertTodoTag(todoId, tagId);
  if (!result) {
    return { status: 'ALREADY_EXISTS' };
  }

  return { status: 'SUCCESS', result };
};

export const getTodoTags = async (todoId) => {
  const todo = await todosDb.selectTodoById(todoId);
  if (!todo) {
    return null;
  }

  return await todosDb.selectTodoTags(todoId);
};

export const removeTagFromTodo = async (todoId, tagId) => {
  const todo = await todosDb.selectTodoById(todoId);
  if (!todo) {
    return { status: 'TODO_NOT_FOUND' };
  }

  const result = await todosDb.deleteTodoTag(todoId, tagId);
  if (!result) {
    return { status: 'TAG_NOT_FOUND' };
  }

  return { status: 'SUCCESS' };
};