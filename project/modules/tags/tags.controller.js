import { createTag, getTags } from './tags.service.js';

export const createTagController = async (req, res) => {
  const { name } = req.body;
  const tag = await createTag(name);

  if (!tag) {
    return res.status(409).json({ error: "Tag already exists" });
  }

  res.status(201).json(tag);
};

export const getTagsController = async (req, res) => {
  const tags = await getTags();
  res.status(200).json(tags);
};