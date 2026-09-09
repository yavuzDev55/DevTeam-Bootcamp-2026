import {
  addUser,
  getUsers,
  getUserByEmail,
  getUsersTodos,
} from "./users.service.js";

export const addUserController = async (req, res) => {
  const { username, email, password } = req.body;

  if (await getUserByEmail(email)) {
    return res.status(409).json({ error: "email already registered" });
  }

  const user = await addUser(username, email, password);
  res.status(201).json(user);
};

export const getUsersController = async (req, res) => {
  res.json(await getUsers());
};

export const getUsersTodosController = async (req, res) => {
  const todos = await getUsersTodos(req.params.id);
  if (!todos) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(todos);
};
