import {
  getTodos,
  addTodo,
  replaceTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
  addTagToTodo,
  getTodoTags,
  removeTagFromTodo
} from "./todos.service.js";

export const getTodosController = async (req, res) => {
  const { completed, q } = req.query;
  const todos = await getTodos({ completed, q });
  res.json(todos);
};

export const addTodoController = async (req, res) => {
  const { title, description, priority, userId } = req.body;
  
  const result = await addTodo({
    title,
    description,
    priority,
    userId: userId ?? null,
  });

  if (result.status === 'USER_NOT_FOUND') {
    return res.status(400).json({ error: "User not found" });
  }

  res.status(201).json(result.todo);
};

export const replaceTodoController = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority } = req.body;
  const todo = await replaceTodo(id, { title, description, completed, priority });
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
};

export const updateTodoController = async (req, res) => {
  const { id } = req.params;
  const todo = await updateTodo(id, req.body);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
};

export const deleteTodoController = async (req, res) => {
  const { id } = req.params;
  const deletedTodo = await deleteTodo(id);
  if (!deletedTodo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(204).json({});
};

export const getTodoByIdController = async (req, res) => {
  const { id } = req.params;
  const todo = await getTodoById(id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
};

export const addTagToTodoController = async (req, res) => {
  const { id } = req.params;
  const { tagId } = req.body;

  const result = await addTagToTodo(id, tagId);

  if (result.status === 'TODO_NOT_FOUND') {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (result.status === 'TAG_NOT_FOUND') {
    return res.status(404).json({ error: "Tag not found" });
  }

  if (result.status === 'ALREADY_EXISTS') {
    return res.status(409).json({ error: "Tag already attached to this todo" });
  }

  res.status(201).json(result.result);
};

export const getTodoTagsController = async (req, res) => {
  const { id } = req.params;
  const tags = await getTodoTags(id);

  if (!tags) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.status(200).json(tags);
};

export const removeTagFromTodoController = async (req, res) => {
  const { id, tagId } = req.params;

  const result = await removeTagFromTodo(id, tagId);

  if (result.status === 'TODO_NOT_FOUND' || result.status === 'TAG_NOT_FOUND') {
    return res.status(404).json({ error: "Relation not found" });
  }

  res.status(204).json({});
};