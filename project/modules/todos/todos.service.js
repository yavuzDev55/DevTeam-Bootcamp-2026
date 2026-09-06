export const todos = [];

export const addTodo = ({ title, description, userId }) => {
  const todo = {
    id: crypto.randomUUID(),
    title,
    description,
    userId: userId ?? null,
    completed: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  return todo;
};

export const replaceTodo = (id, { title, description, completed }) => {
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return;
  }
  todo.title = title;
  todo.description = description;
  todo.completed = completed;
  return todo;
}

export const updateTodo = (id, fields) => {
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return;
  }
  Object.assign(todo, fields);
  return todo;
};

export const deleteTodo = (id) => {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return;
  }
  const deletedTodo = todos.splice(index, 1)[0];
  return deletedTodo;
}

export const getTodos = () => {
  return todos;
};

export const getTodoById = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  if (!todo) {
    return;
  }
  return todo;
};

export const getTodosByUserId = (userId) => {
  return todos.filter(todo => todo.userId === userId);
}

// TODO (Aşama 1): replaceTodo, updateTodo ve deleteTodo fonksiyonlarını ekleyin.
//
// Hatırlatma: service katmanı req/res görmez. Parametre alır, iş yapar,
// sonuç döndürür. Bulunamayan kayıt için status kodu seçmek controller'ın işi;
// service sadece "bulamadım" bilgisini döndürsün (ör. undefined).
