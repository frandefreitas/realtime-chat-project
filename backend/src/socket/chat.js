const Message = require("../models/Message");
const User = require("../models/User");

function setupSocket(io) {
  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    
    socket.join(String(userId));

    try {
      await User.findByIdAndUpdate(userId, { online: true });
      
      socket.broadcast.emit("user:status", { userId: String(userId), online: true });

      const onlineUsers = await User.find({ online: true }, { _id: 1 });
      socket.emit("users:online", onlineUsers.map(u => String(u._id)));
    } catch (err) {
      console.error("Erro ao atualizar status online:", err);
    }
    
    socket.on("message:send", async ({ to, text }, cb) => {
      try {
        if (!to || !text?.trim()) {
          return cb?.({ ok: false, error: "Mensagem inválida" });
        }

        const message = await Message.create({
          from: userId,
          to,
          text: text.trim()
        });

        socket.to(String(to)).emit("message:new", message);
        
        cb?.({ ok: true, message });
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err);
        cb?.({ ok: false, error: "Erro ao enviar mensagem" });
      }
    });

    socket.on("typing:start", ({ to }) => {
      socket.to(String(to)).emit("typing:update", { userId, typing: true });
    });

    socket.on("typing:stop", ({ to }) => {
      socket.to(String(to)).emit("typing:update", { userId, typing: false });
    });

    socket.on("disconnect", async () => {
      try {
        await User.findByIdAndUpdate(userId, { online: false });
        
        socket.broadcast.emit("user:status", { userId: String(userId), online: false });
      } catch (err) {
        console.error("Erro ao atualizar status offline:", err);
      }
    });
  });
}

module.exports = { setupSocket };
