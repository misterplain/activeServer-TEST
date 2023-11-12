require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const app = express();
const cors = require("cors");
const path = require("path");
const { logger } = require("./middleware/logger");
const { logEvents } = require("./middleware/logger");
//config
const connectDB = require("./config/connectDB");
//boilerPlate
const cookieSession = require("cookie-session");
const session = require("express-session");
const passportSetup = require("./boilerPlate/passport");
//notepad routes
const contactRoute = require("./HPNotePad/routes/contactRoute");
const logRoute = require("./HPNotePad/routes/logRoute");
const dataRoute = require("./HPNotePad/routes/dataRoute");
//bcnMinmalista routes
const usersRoutes = require("./bcnMinimalista/routes/usersRoutes");
const authRoutes = require("./bcnMinimalista/routes/authRoutes");
const refreshRoutes = require("./bcnMinimalista/routes/refreshRoutes");
const logoutRoutes = require("./bcnMinimalista/routes/logoutRoutes");
const blogsRoutes = require("./bcnMinimalista/routes/blogsRoutes");
const collabRoutes = require("./bcnMinimalista/routes/collabRoutes");
const favoritesRoutes = require("./bcnMinimalista/routes/favoritesRoutes");
const commentsRoutes = require("./bcnMinimalista/routes/commentsRoutes");
//porfolio routes
const contactPortfolioRoute = require("./portfolio/routes/contactRoute");
//fantasticfy
const fetchDataRoute = require("./Fantasticfy/routes/fetchDataRoute");
//boilerPlate routes
const authRoutesBoilerPlate = require("./boilerPlate/routes/auth");
//keep active
const keepActiveRoutes = require("./keepActive/keepActiveRoute");
const keepServerActive = require("./keepActive/keepServerActive");
//nodecron
const nodemailer = require("nodemailer");
const nodeCron = require("node-cron");

//Connect to Mongo DB
connectDB();

app.use(
  session({
    secret: "privateKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//custom middleware logger
app.use(logger);
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

app.use("/", express.static(path.resolve(path.join(__dirname, "./build"))));

app.use(express.json());
const whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://hpnotepad.onrender.com",
  "https://fantasticfy.onrender.com",
  "https://patrickobrien.onrender.com",
  "https://bcnminimalista.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin: ", origin); 
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/log", logRoute);

//notepad
app.use("/notepad/contact", contactRoute);
app.use("/notepad/data", dataRoute);

//bcnMinimalista
app.use("/bcnmin/users", usersRoutes);
app.use("/bcnmin/auth", authRoutes);
app.use("/bcnmin/refresh", refreshRoutes);
app.use("/bcnmin/logout", logoutRoutes);
app.use("/bcnmin/blogs", blogsRoutes);
app.use("/bcnmin/collab", collabRoutes);
app.use("/bcnmin/favorites", favoritesRoutes);
app.use("/bcnmin/comments", commentsRoutes);

//portfolio
app.use("/portfolio/contact", contactPortfolioRoute);

//fantasticfy
app.use("/fantasticfy/data", fetchDataRoute);

//boilerPlate
app.use("/auth", authRoutesBoilerPlate);

//keepActive
// keepServerActive()
// app.use("/keepActive", keepActiveRoutes);

const port = process.env.PORT || 5000;

app.listen(port, console.log(`server listing to port 5000 only`));
