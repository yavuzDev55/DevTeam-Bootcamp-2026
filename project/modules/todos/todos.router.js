import express from "express";
import {
  getTodosController,
  addTodoController,
  replaceTodoController,
  updateTodoController,
  deleteTodoController,
  getTodoByIdController,
  addTagToTodoController,
  getTodoTagsController,
  removeTagFromTodoController
} from "./todos.controller.js";
import { validateAddTodo, validateReplaceTodo, validateUpdateTodo, validateDeleteTodo, validateAddTagToTodo } from "./todos.validator.js";

const r = express.Router();

r.get("/", getTodosController);

r.post("/", validateAddTodo, addTodoController);

r.put("/:id", validateReplaceTodo, replaceTodoController);

r.patch("/:id", validateUpdateTodo, updateTodoController);

r.delete("/:id", validateDeleteTodo, deleteTodoController);

r.get("/:id", getTodoByIdController);

r.post('/:id/tags', validateAddTagToTodo, addTagToTodoController);

r.get('/:id/tags', getTodoTagsController);

r.delete('/:id/tags/:tagId', removeTagFromTodoController);

export default r;
