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

  if(userId !== undefined && userId !== null) {
    const user = getUserById(userId);
    if(!user) {
      return res.status(400).json({
        error: "User not found"
      });
    }
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
  const { title, description, completed } = req.body;
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
  next();
};

export const validateUpdateTodo = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Invalid todo ID",
    });
  }
  const { title, description, completed } = req.body;
  if(title  === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({
      error: "At least one of title, description or completed is required",
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

// TODO (Aşama 1): validateReplaceTodo ve validateUpdateTodo middleware'lerini
// ekleyin.
//
//   validateReplaceTodo (PUT)  → title, description ve completed'ın üçü de
//                                zorunlu ve doğru tipte olmalı.
//   validateUpdateTodo (PATCH) → en az bir geçerli alan gönderilmiş olmalı;
//                                gönderilen alanların tipi doğru olmalı.
//
// Hatırlatma: hata durumunda next() ÇAĞIRMAYIN — zinciri 400 ile kesin.
// Ve res.status(400).json(...) satırının başına return koymayı unutmayın.
