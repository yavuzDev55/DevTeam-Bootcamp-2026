import {
  getTodos,
  addTodo,
  getTodoById,
  replaceTodo,
  updateTodo,
  deleteTodo,
} from "./todos.service.js";

export const getTodosController = async (req, res) => {
  const { completed, q } = req.query;
  res.json(await getTodos({ completed, q }));
};

export const addTodoController = async (req, res) => {
  const { title, description, userId } = req.body;
  const todo = await addTodo(title, description, userId ?? null);
  res.status(201).json(todo);
};

export const getTodoByIdController = async (req, res) => {
  const todo = await getTodoById(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
};

export const replaceTodoController = async (req, res) => {
  const { title, description, completed } = req.body;
  const todo = await replaceTodo(req.params.id, {
    title,
    description,
    completed,
  });
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
};

export const updateTodoController = async (req, res) => {
  const todo = await updateTodo(req.params.id, req.body);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
};

export const deleteTodoController = async (req, res) => {
  const deleted = await deleteTodo(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(204).send();
};
