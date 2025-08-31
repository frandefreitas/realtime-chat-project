const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const upload = require("../lib/upload");

const router = express.Router();

// Register
router.post("/register", upload.single("avatar"), async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body || {};
    if (!name || !username || !password) {
      return res.status(400).json({ error: "Campos obrigatórios: name, username, password" });
    }

    const normUsername = String(username || "").trim().toLowerCase();
    const normEmail = String(email || "").trim().toLowerCase() || undefined;

    const exists = await User.findOne({
      $or: [{ username: normUsername }, { email: normEmail }]
    });
    if (exists) return res.status(409).json({ error: "Usuário já existe" });

    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const user = new User({
      name: String(name).trim(),
      username: String(username || "").trim().toLowerCase(),
      email: String(email || "").trim().toLowerCase() || undefined,
      password,
      avatarUrl,
    });

    await user.save();
    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

//Login
router.post("/login",
  (req, _res, next) => {
    const { usernameOrEmail } = req.body || {};
    req.body.username = String(usernameOrEmail || "").trim().toLowerCase();
    next();
  },
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || "Credenciais inválidas" });

      req.logIn(user, async (err2) => {
        if (err2) return next(err2);

        if (req.body?.remember && req.session?.cookie) {
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
        }

        try {
          await User.findByIdAndUpdate(user._id, { online: true });
          req.app.get("io")?.emit("user:status", { userId: String(user._id), online: true });
        } catch { }

        const { _id, name, username, email, avatarUrl, online } = user;
        return res.json({ ok: true, user: { _id, name, username, email, avatarUrl, online } });
      });
    })(req, res, next);
  }
);


// Me
router.get("/me", (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ authenticated: false });
  }
  const { _id, name, username, email, avatarUrl, online } = req.user;
  return res.json({ authenticated: true, user: { _id, name, username, email, avatarUrl, online } });
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const userId = req.user?._id;
    if (req.logout) {
      await new Promise((resolve, reject) => req.logout(err => err ? reject(err) : resolve()));
    }
    await new Promise((resolve, reject) => req.session.destroy(err => err ? reject(err) : resolve()));
    res.clearCookie("connect.sid");
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { online: false });
        req.app.get("io")?.emit("user:status", { userId: String(userId), online: false });
      } catch { }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Erro ao encerrar sessão" });
  }
});

module.exports = router;
