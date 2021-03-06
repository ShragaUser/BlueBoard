import express from "express";
import { MongoClient } from "mongodb";
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongo";
import compression from "compression";
import serveStatic from "express-static-gzip";
import helmet from "helmet";
import favicon from "serve-favicon";
import logger from "morgan";
import dotenv from "dotenv";
import renderPage from "./renderPage";
import configurePassport from "./passport";
import api from "./routes/api";
import auth from "./routes/auth";
import fetchBoardData from "./fetchBoardData";
import http from "http";
import cookieParser from 'cookie-parser';

// Load environment variables from .env file
dotenv.config();

const app = express();

const MongoStore = connectMongo(session);

MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true }).then(client => {
  const db = client.db(process.env.MONGODB_NAME);

  configurePassport(db);
  app.get("/isAlive", (req,res,next)=>{
    res.send("alive");
  })
  app.get("/metadata.xml", (req,res,next)=>{
    res.sendFile((process.env.METADATA_FILE || "/usr/src/app/src/assets/metadata.xml"));
  })
  app.use(helmet());
  app.use(logger("tiny"));
  app.use(compression());
  app.use(cookieParser());
  app.use(favicon("dist/public/favicons/favicon.ico"));
  app.use(express.json({limit:"100mb"}));
  app.use(express.urlencoded({ extended: true, limit:"100mb" }));
  // aggressive cache static assets (1 year)
  // app.use("/static", express.static("dist/public", { maxAge: "1y" }));
  app.use(
    "/static",
    serveStatic("dist/public", { enableBrotli: true, maxAge: "1y" })
  );

  // Persist session in mongoDB
  app.use(
    session({
      store: new MongoStore({ db }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/auth", auth);
  app.use("/api", api(db));
  app.use(fetchBoardData(db));

  app.use((req,res,next)=>{
    if(!req.user)
      res.redirect("/auth/shraga");
    else
      next();
  })
  app.get("*", renderPage);

  const port = process.env.PORT || "1337";
  /* eslint-disable no-console */
  const server = http.createServer(app);
  server.listen(port, () => console.log(`Server listening on port ${port}`));
  
});
