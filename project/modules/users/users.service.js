import * as usersDb from './users.db.js';

export const addUser = async (username, email, password) => {
  return await usersDb.insertUser({ username, email, password });
};

export const getUsers = async () => {
  return await usersDb.selectAllUsers();
};

export const getUserById = async (id) => {
  return await usersDb.selectUserById(id);
};

export const getUserByEmail = async (email) => {
  return await usersDb.selectUserByEmail(email);
};

export const getProfileByUserId = async (userId) => {
  const user = await usersDb.selectUserById(userId);
  if (!user) {
    return { status: 'USER_NOT_FOUND' };
  }

  const profile = await usersDb.selectProfileByUserId(userId);
  if (!profile) {
    return { status: 'PROFILE_NOT_FOUND' };
  }

  return { status: 'SUCCESS', profile };
};

export const updateUserProfile = async (userId, bio) => {
  const user = await usersDb.selectUserById(userId);
  if (!user) {
    return null;
  }

  return await usersDb.upsertProfile(userId, bio);
};

export const publicUser = (user) => user;