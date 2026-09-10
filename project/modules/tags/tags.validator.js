export const validateCreateTag = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Tag name is required" });
  }

  req.body.name = name.trim();
  next();
};