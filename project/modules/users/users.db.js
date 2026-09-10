import prisma from '../../db/prisma.js';

const userSelectFields = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
};

const profileSelectFields = {
  id: true,
  bio: true,
  userId: true,
};

export const selectAllUsers = async () => {
  return await prisma.user.findMany({
    select: userSelectFields,
    orderBy: { createdAt: 'desc' },
  });
};

export const selectUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: userSelectFields,
  });
};

export const selectUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    select: userSelectFields,
  });
};

export const insertUser = async (userData) => {
  const { username, email, password } = userData;

  const existingUser = await selectUserByEmail(email);
  if (existingUser) return null;

  return await prisma.user.create({
    data: { username, email, password },
    select: userSelectFields,
  });
};

export const selectProfileByUserId = async (userId) => {
  return await prisma.profile.findUnique({
    where: { userId },
    select: profileSelectFields,
  });
};

export const upsertProfile = async (userId, bio) => {
  return await prisma.profile.upsert({
    where: { userId },
    update: { bio },
    create: { userId, bio },
    select: profileSelectFields,
  });
};