const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

function isAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Não autenticado" });
}

router.get("/:peerId", isAuth, async (req, res, next) => {
  try {
    const me = req.user._id;
    const peer = req.params.peerId;
    const messages = await Message.find({
      $or: [
        { from: me, to: peer },
        { from: peer, to: me }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (e) { next(e); }
});

module.exports = router;
