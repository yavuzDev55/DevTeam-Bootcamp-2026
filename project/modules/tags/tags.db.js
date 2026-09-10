import prisma from '../../db/prisma.js';

const tagSelectFields = {
  id: true,
  name: true,
};

export const selectAllTags = async () => {
  return await prisma.tag.findMany({
    select: tagSelectFields,
    orderBy: { name: 'asc' },
  });
};

export const selectTagById = async (id) => {
  return await prisma.tag.findUnique({
    where: { id },
    select: tagSelectFields,
  });
};

export const selectTagByName = async (name) => {
  return await prisma.tag.findUnique({
    where: { name },
    select: tagSelectFields,
  });
};

export const insertTag = async (name) => {
  const existingTag = await selectTagByName(name);
  if (existingTag) return null;

  return await prisma.tag.create({
    data: { name },
    select: tagSelectFields,
  });
};