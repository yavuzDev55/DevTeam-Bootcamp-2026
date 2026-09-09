import * as usersDB from "./users.db.js";
import { getTodosByUserId } from "../todos/todos.service.js";

export const addUser = async (username, email, password) => {
  const user = await usersDB.insertUser(username, email, password);
  const pubUser = publicUser(user);
  return pubUser;
};

export const getUsers = async () => {
  const users = await usersDB.selectUsers();
  return users.map(publicUser);
};

export const getUserById = async (id) => {
  const user = await usersDB.selectUserById(id);
  if (!user) {
    return null;
  }
  const pubUser = publicUser(user);
  return pubUser;
};

export const getUserByEmail = async (email) => {
  const user = await usersDB.selectUserByEmail(email);
  if (!user) {
    return null;
  }
  const pubUser = publicUser(user);
  return pubUser;
};
export const getUsersTodos = async (userId) => {
  const user = await usersDB.selectUserById(userId);
  if (!user) {
    return null;
  }
  return getTodosByUserId(userId);
};
/** password alanini ayiklanmis kopya dondurur. */
export const publicUser = ({ id, username, email, createdAt }) => ({
  id,
  username,
  email,
  createdAt,
});
