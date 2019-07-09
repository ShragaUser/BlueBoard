import passport from "passport";
import dotenv from "dotenv";
import { Strategy as LocalStrategy } from "passport-local";
import createWelcomeBoard from "./createWelcomeBoard";
const { Strategy } = require("passport-shraga");
import { transformUser } from "../app/components/utils";
import authConfig from "./authConfig";

dotenv.config();

const configurePassport = db => {
  const users = db.collection("users");
  const boards = db.collection("boards");

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });
  passport.deserializeUser((id, cb) => {
    users.findOne({_id: id }).then(user => {
      if(user.provider != "ADFS"){
        cb(null, false);
      }
      cb(null, transformUser(user));
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, cb) {
      let profile={id:username+password,displayName:username}
      users.findOne({ name: username }).then(user => {
        if (user) {
          cb(null, user);
        } else {
          const newUser = {
            _id: profile.id,
            name: profile.displayName,
            imageUrl: null
          };
          users.insertOne(newUser).then(() => {
            boards
              .insertOne(createWelcomeBoard(profile.id))
              .then(() => cb(null, newUser));
          });
        }
      });
    }
  ));

  const config = authConfig();


  passport.use(new Strategy(config, (profile, done) => {
    profile = { ...profile };
    profile._id = profile.id;
    delete profile.id;
    users.replaceOne({ _id: profile._id }, profile, { upsert: true })
      .then(result => {
        const { matchedCount, modifiedCount } = result;
        if (matchedCount && modifiedCount) {
          console.log(`Successfully added a new review.`)
        }
        done(null, transformUser(profile));
      });
  }))
};


export default configurePassport;
