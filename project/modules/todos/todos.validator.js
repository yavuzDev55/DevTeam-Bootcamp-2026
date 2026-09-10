import { getUserById } from "../users/users.service.js";

export const validateAddTodo = (req, res, next) => {
  const { title, description, userId } = req.body;

  if (
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string"
  ) {
    return res.status(400).json({
      error: "Title and description are required and must be strings",
    });
  }

  next();
};

export const validateReplaceTodo = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Invalid todo ID",
    });
  }
  const { title, description, completed, priority } = req.body;
  if (
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({
      error: "Title, description and completed are required and must be of correct type",
    });
  }
  if (priority !== undefined && priority !== null && (!Number.isInteger(priority) || typeof priority !== "number")) {
    return res.status(400).json({
      error: "Priority must be an integer",
    });
  }
  next();
};

export const validateUpdateTodo = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Invalid todo ID",
    });
  }
  const { title, description, completed, priority } = req.body;
  if(title  === undefined && description === undefined && completed === undefined && priority === undefined) {
    return res.status(400).json({
      error: "At least one of title, description, completed or priority is required",
    });
  }
  if(title !== undefined && typeof title !== "string") {
    return res.status(400).json({
      error: "Title must be a string",
    });
  } 
  if(description !== undefined && typeof description !== "string") {  
    return res.status(400).json({
      error: "Description must be a string",
    });
  }
  if(completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be a boolean",
    });
  }

  if(priority !== undefined && (!Number.isInteger(priority) || typeof priority !== "number")) {
    return res.status(400).json({
      error: "Priority must be an integer",
    });
  }
  next();
}

export const validateDeleteTodo = (req, res, next) => {
  const { id } = req.params;  
  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Invalid todo ID",
    });
  }
  next();
}

export const validateAddTagToTodo = (req, res, next) => {
  const { tagId } = req.body;

  if (!tagId || typeof tagId !== 'string') {
    return res.status(400).json({ error: "tagId is required" });
  }

  next();
};