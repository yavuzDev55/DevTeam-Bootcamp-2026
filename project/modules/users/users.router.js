import express from "express";
import {
  addUserController,
  getUsersController,
  getUserTodosController,
  getUserProfileController,
  updateUserProfileController 
} from "./users.controller.js";
import {  
    validateAddUser,
    validateGetUserTodos

} from "./users.validator.js";

const r = express.Router();

r.post("/", validateAddUser, addUserController);

r.get("/", getUsersController);

r.get("/:id/todos", validateGetUserTodos, getUserTodosController);

r.get('/:id/profile', getUserProfileController);

r.put('/:id/profile', updateUserProfileController);


export default r;

// Aşama 2 — users modülünün ROUTER katmanı.
//
// Router başka iş yapmaz: yol + metodu doğru zincire bağlar, o kadar.
//
// Bağlamanız gerekenler:
//
//   POST   /          → validateAddUser, addUserController
//   GET    /          → getUsersController
//   GET    /:id/todos → getUserTodosController
//
// Bitirince app.js'e bağlamayı unutmayın:
//
//   server.use("/users", usersRouter);
//
// (todos router'ının hemen altına, notFoundHandler'dan ÖNCE.)
