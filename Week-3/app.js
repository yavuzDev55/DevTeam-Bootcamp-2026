import express from "express";
import todosRouter from "./modules/todos/todos.router.js";
import usersRouter from "./modules/users/users.router.js";
import notFoundHandler from "./utils/notFoundHandler.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
  res.send("Hello World");
});

server.use("/todos", todosRouter);
server.use("/users", usersRouter);

server.use(notFoundHandler);
server.use(globalErrorHandler);

export default server;
