import express from "express";
import {
  getTodosController,
  addTodoController,
  getTodoByIdController,
  replaceTodoController,
  updateTodoController,
  deleteTodoController,
} from "./todos.controller.js";
import {
  validateAddTodo,
  validateReplaceTodo,
  validateUpdateTodo,
} from "./todos.validator.js";

const r = express.Router();

r.get("/", getTodosController);
r.post("/", validateAddTodo, addTodoController);

r.get("/:id", getTodoByIdController);
r.put("/:id", validateReplaceTodo, replaceTodoController);
r.patch("/:id", validateUpdateTodo, updateTodoController);
r.delete("/:id", deleteTodoController);

export default r;
