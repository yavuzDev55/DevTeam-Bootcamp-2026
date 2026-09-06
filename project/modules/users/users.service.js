export const users = []; 

export const publicUser = ({ id, username, email, createdAt }) => ({
  id, 
  username, 
  email, 
  createdAt,
});

export const addUser = (username, email, password) => {
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return null; // User with this email already exists
    }

    const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        password,
        createdAt: new Date(),
    };

    users.push(newUser);
    return newUser;
};

export const getUsers = () => {
    return users;
}

export const getUserById = (id) => {
    return users.find(user => user.id === id);
}

export const getUserByEmail = (email) => {
    return users.find(user => user.email === email);
}

// Aşama 2 — users modülünün SERVICE katmanı.
//
// Bu katman HTTP bilmez: req/res görmez, status kodu seçmez.
// Parametre alır, iş yapar, sonuç döndürür.
//
// Yazmanız gerekenler:
//
//   users                          → in-memory dizi (todos.service.js'teki gibi)
//   addUser(username, email, password)
//       → { id, username, email, password, createdAt } oluşturup diziye ekler
//       → id için crypto.randomUUID() kullanın
//   getUsers()                     → tüm kullanıcılar
//   getUserById(id)                → tek kullanıcı, yoksa undefined
//   getUserByEmail(email)          → e-posta benzersizlik kontrolü için
//
// DİKKAT: password alanı bellekte saklanır ama hiçbir yanıtta dönmemeli.
// Bunu nerede çözeceğiniz size kalmış — service'te "password'süz kopya"
// döndürmek de, controller'da ayıklamak da kabul edilir.
