import express from "express";
import todosRouter from "./modules/todos/todos.router.js";
import usersRouter from "./modules/users/users.router.js";
import tagsRouter from "./modules/tags/tags.router.js";
import notFoundHandler from "./utils/notFoundHandler.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";

const server = express();

server.use(express.json());

server.use("/todos", todosRouter);

server.use("/users", usersRouter);

server.use('/tags', tagsRouter);

server.get("/", (req, res) => {
  res.send("Hello World");
});

export default server;

server.use(notFoundHandler);
server.use(globalErrorHandler);
