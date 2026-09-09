import express from "express";
import {
  addUserController,
  getUsersController,
  getUsersTodosController,
} from "./users.controller.js";
import { validateAddUser } from "./users.validator.js";

const r = express.Router();

r.post("/", validateAddUser, addUserController);
r.get("/", getUsersController);
r.get("/:id/todos", getUsersTodosController);

export default r;
