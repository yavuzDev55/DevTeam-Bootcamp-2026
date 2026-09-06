import express from "express";
import {
  getTodosController,
  addTodoController,
  replaceTodoController,
  updateTodoController,
  deleteTodoController,
  getTodoByIdController,
} from "./todos.controller.js";
import { validateAddTodo, validateReplaceTodo, validateUpdateTodo, validateDeleteTodo } from "./todos.validator.js";

const r = express.Router();

r.get("/", getTodosController);

r.post("/", validateAddTodo, addTodoController);

r.put("/:id", validateReplaceTodo, replaceTodoController);

r.patch("/:id", validateUpdateTodo, updateTodoController);

r.delete("/:id", validateDeleteTodo, deleteTodoController);

r.get("/:id", getTodoByIdController);

// TODO (Aşama 1): PUT /:id, PATCH /:id ve DELETE /:id route'larını ekleyin.
// Güncelleme route'larının önüne uygun validator'ları zincirlemeyi unutmayın.

export default r;
