require("dotenv").config();
const path = require("path");
const cluster = require("cluster");
const os = require("os");
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const passport = require("./auth/passport");
const { Server } = require("socket.io");

const ENABLE_CLUSTER = process.env.CLUSTER === "1" || process.env.CLUSTER === "true";
const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/realtime-chat";
const ORIGIN = process.env.CLIENT_URL || "http://localhost:3000";
const SESSION_SECRET = process.env.SESSION_SECRET || "devsecret";

if (ENABLE_CLUSTER && cluster.isPrimary) {
  const count = Number(process.env.WORKERS || os.cpus().length) || 1;
  console.log(`[cluster] starting ${count} workers`);
  for (let i = 0; i < count; i++) cluster.fork();
  cluster.on("exit", (w, code) => {
    console.log(`[cluster] worker ${w.process.pid} exited (${code}), restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: ORIGIN, credentials: true } });
  app.set("io", io);

  app.use(cors({ origin: ORIGIN, credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  const uploadsPath = path.join(__dirname, "../uploads");
  console.log("[Static Files] Pasta de uploads:", uploadsPath);
  app.use("/uploads", express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }));

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: "lax", maxAge: 1000*60*60*24*7 },
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    name: "connect.sid",
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/messages", require("./routes/messages"));

  const { socketAuth } = require("./socket/middleware");
  const { setupSocket } = require("./socket/chat");
  
  io.use(socketAuth);
  
  setupSocket(io);

  mongoose.set("strictQuery", true);
  mongoose.connect(MONGO_URI).then(() => {
    console.log("MongoDB conectado:", MONGO_URI);
    server.listen(PORT, () => console.log(`API & WS on :${PORT}`));
  }).catch((err) => {
    console.error("Falha ao conectar no MongoDB", err);
    process.exit(1);
  });
}
