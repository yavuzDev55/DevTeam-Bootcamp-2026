import { getTodos, addTodo, replaceTodo, updateTodo, deleteTodo, getTodoById } from "./todos.service.js";

export const getTodosController = (req, res) => {
  const todos = getTodos();
  res.json(todos);
};

export const addTodoController = (req, res) => {
  const { title, description, userId } = req.body;
  const todo = addTodo({
    title,
    description,
    userId: userId ?? null
  });
  res.status(201).json(todo);
};

export const replaceTodoController = (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  const todo = replaceTodo(id, { title, description, completed });
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
};

export const updateTodoController = (req, res) => {
  const { id } = req.params;
  const todo = updateTodo(id, req.body);
  if(!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
}

export const deleteTodoController = (req, res) => {
  const { id } = req.params;
  const deletedTodo = deleteTodo(id);
  if(!deletedTodo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(204).json({});
}

export const getTodoByIdController = (req, res) => {
  const { id } = req.params;
  const todo = getTodoById(id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
};

// TODO (Aşama 1): replaceTodoController, updateTodoController ve
// deleteTodoController fonksiyonlarını ekleyin.
//
// Hatırlatma: controller HTTP'yi bilir — req'ten okur, status kodunu seçer,
// yanıtı yazar. İş kuralları service katmanında kalmalı.
