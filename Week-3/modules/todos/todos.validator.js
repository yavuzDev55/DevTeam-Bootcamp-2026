import { getUserById } from "../users/users.service.js";

const metinMi = (deger) => typeof deger === "string" && deger.trim() !== "";

export const validateAddTodo = async (req, res, next) => {
  const { title, description, userId } = req.body;

  if (!metinMi(title) || !metinMi(description)) {
    return res.status(400).json({
      error: "Title and description are required and must be strings",
    });
  }

  if (userId !== undefined && userId !== null) {
    if (!(await getUserById(userId))) {
      return res.status(400).json({ error: "User not found" });
    }
  }

  next();
};

export const validateReplaceTodo = (req, res, next) => {
  const { title, description, completed } = req.body;

  if (
    !metinMi(title) ||
    !metinMi(description) ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({
      error: "PUT requires title, description and completed",
    });
  }

  next();
};

export const validateUpdateTodo = (req, res, next) => {
  const { title, description, completed } = req.body;

  const gonderilenler = [title, description, completed].filter(
    (deger) => deger !== undefined,
  );

  if (gonderilenler.length === 0) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  if (title !== undefined && !metinMi(title)) {
    return res.status(400).json({ error: "title must be a string" });
  }
  if (description !== undefined && !metinMi(description)) {
    return res.status(400).json({ error: "description must be a string" });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be a boolean" });
  }

  next();
};
