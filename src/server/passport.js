import passport from "passport";
import dotenv from "dotenv";
import authConfig from "./authConfig";
import createWelcomeBoard from "./createWelcomeBoard";
const { Strategy } = require("passport-shraga");

dotenv.config();

const configurePassport = db => {
  const users = db.collection("users");
  const boards = db.collection("boards");

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });
  passport.deserializeUser((id, cb) => {
    users.findOne({ _id: id }).then(user => {
      cb(null, user);
    });
  });
  
  const config = { shragaURL: "http://localhost:3000", callbackURL: "http://localhost:1337/auth/shraga" };

  passport.use(new Strategy(config, (profile, done) => {
    profile = {...profile};
    users.findOne({ _id: profile.id }).then(user => {
      if (user) {
        done(null, user);
      } else {
        const newUser = {
          _id: profile.id,
          name: profile.name.lastName + " " + profile.name.firstName,
          mail: profile.mail,
          display: profile.displayName,
          imageUrl: null
        };

        users.insertOne(newUser).then(() => {
          boards
            .insertOne(createWelcomeBoard(profile.id))
            .then(() => done(null, newUser));
        });
      }
    });
  }
  ))
};

export default configurePassport;
