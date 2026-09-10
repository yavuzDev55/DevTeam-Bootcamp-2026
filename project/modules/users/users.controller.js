import {
  addUser,
  getUsers,
  getUserById,
  getProfileByUserId,
  updateUserProfile,
  publicUser
} from './users.service.js';

import { getTodosByUserId } from '../todos/todos.service.js';

export const addUserController = async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = await addUser(username, email, password);

  if (!newUser) {
    return res.status(409).json({ error: "Email already exists" });
  }

  res.status(201).json(publicUser(newUser));
};

export const getUsersController = async (req, res) => {
  const users = await getUsers();
  const publicUsers = users.map(publicUser);
  res.status(200).json(publicUsers);
};

export const getUserTodosController = async (req, res) => {
  const { id } = req.params;
  const user = await getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const todos = await getTodosByUserId(user.id);
  res.status(200).json(todos);
};

export const getUserProfileController = async (req, res) => {
  const { id } = req.params;
  const result = await getProfileByUserId(id);

  if (result.status === 'USER_NOT_FOUND') {
    return res.status(404).json({ error: "User not found" });
  }

  if (result.status === 'PROFILE_NOT_FOUND') {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.status(200).json(result.profile);
};

export const updateUserProfileController = async (req, res) => {
  const { id } = req.params;
  const { bio } = req.body;

  if (bio === undefined || bio === null || typeof bio !== 'string' || bio.trim() === '') {
    return res.status(400).json({ error: "Bio is required" });
  }

  const profile = await updateUserProfile(id, bio);

  if (!profile) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(profile);
};