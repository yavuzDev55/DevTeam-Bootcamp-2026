const metinMi = (deger) => typeof deger === "string" && deger.trim() !== "";

export const validateAddUser = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!metinMi(username) || !metinMi(email) || !metinMi(password)) {
    return res.status(400).json({
      error: "username, email and password are required",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "email format is invalid" });
  }

  next();
};
