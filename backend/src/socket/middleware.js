const cookie = require("cookie");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("../auth/passport");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/realtime-chat";
const SESSION_SECRET = process.env.SESSION_SECRET || "devsecret";

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  name: "connect.sid",
});

function socketAuth(socket, next) {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const sid = cookies["connect.sid"];
    if (!sid) return next(new Error("Não autenticado"));

    const req = {
      method: "GET",
      url: socket.handshake.url,
      headers: socket.handshake.headers,
      cookies: { "connect.sid": sid }
    };
    const res = {};

    sessionMiddleware(req, res, () => {
      passport.initialize()(req, res, () => {
        passport.session()(req, res, () => {
          if (!req.user) return next(new Error("Não autenticado"));
          socket.user = req.user;
          next();
        });
      });
    });
  } catch (err) {
    next(new Error("Erro na autenticação"));
  }
}

module.exports = { socketAuth };
