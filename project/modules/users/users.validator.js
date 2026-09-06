export const validateAddUser = (req, res, next) => {
  const { username, email, password } = req.body;
  if ( !username || !email || !password || typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Username, email and password are required and must be strings",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Email must contain '@' symbol",
    });
  }

  next();
};


export const validateGetUserTodos = (req, res, next) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }
    next();
}

// Aşama 2 — users modülünün VALIDATOR katmanı.
//
// Yazmanız gerekenler:
//
//   validateAddUser(req, res, next)
//       → username, email ve password zorunlu ve string olmalı
//       → email en azından "@" içermeli
//       → kural ihlalinde 400 ile zinciri kesin, next() çağırmayın
//
// Hatırlatma: "bu e-posta zaten kayıtlı" kontrolü bir doğrulama değil,
// bir iş kuralıdır — ve 400 değil 409 döner. Onu service/controller
// tarafında çözmek daha doğru.
