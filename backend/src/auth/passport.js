const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

passport.use(new LocalStrategy({
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true,
}, async (req, username, password, done) => {
  try {
    const q = String(username || "").trim().toLowerCase();
    const query = { $or: [{ username: q }, { email: q }] };

    const user = await User.findOne(query).select("+password");
    if (!user) return done(null, false, { message: "Credenciais inválidas" });
    const ok = await user.comparePassword(password);
    if (!ok) return done(null, false, { message: "Credenciais inválidas" });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

module.exports = passport;
