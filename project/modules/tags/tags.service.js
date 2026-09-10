import * as tagsDb from './tags.db.js';

export const createTag = async (name) => {
  return await tagsDb.insertTag(name);
};

export const getTags = async () => {
  return await tagsDb.selectAllTags();
};

export const getTagById = async (id) => {
  return await tagsDb.selectTagById(id);
};