const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    
    const users = await User.find({}, { name:1, username:1, email:1, avatarUrl:1, online:1 }).sort({ name:1 });
    res.json({ users });
  } catch (e) { next(e); }
});

module.exports = router;
