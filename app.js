require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
require("./auth");
const PORT = 3000;

//save secret in env file

//ROUTES
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const commentRouter = require("./routes/commentRouter");
const fileUploadRouter = require("./routes/fileUploadRouter");
const gradePointRouter = require("./routes/gradePointRouter");
const resetRoutes = require("./routes/resetPasswordRouter");

const app = express();

//INITIALIZE
app.use(logger("dev"));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client")));
app.use(
  session({
    name: "session-id",
    secret: "Thisisourlittlesecret",
    resave: false,
    saveUninitialized: false,
    //cookie: {secure: false}
  })
);
app.use(passport.initialize());
app.use(passport.session());

//ROUTES
app.use("", userRouter);
app.use("", postRouter);
app.use("/posts", commentRouter);
app.use("", fileUploadRouter);
app.use("", gradePointRouter);
app.use("", resetRoutes);

//Unhandled routes
app.all("*", (req, res) => {
  res.status(404).send("Sorry, the requested route was not found");
});

//CONNECTIONS
mongoose.set("strictQuery", true);
const url = "mongodb://127.0.0.1:27017/eesaDB";
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  autoIndex: false,
});
connect
  .then(() => {
    console.log("connected to db succesfully");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
