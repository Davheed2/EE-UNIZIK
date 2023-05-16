const express = require("express");
const userRouter = express.Router();
const Controller = require("../controllers/userController");
const passport = require("passport");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};

const isAdmin = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.role === "admin") ||
    req.user.role === "superuser"
  ) {
    return next();
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
};

const isSuperUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "superuser") {
    return next();
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
};

//USER AUTHENTICATION
userRouter.get("/users/logout", Controller.logout);
//userRouter.get("/auth/google", Controller.googleLogin);
//userRouter.get("/auth/google/callback", Controller.googleLoginHome);
userRouter.post("/users/register", Controller.register);
userRouter.post("/users/login", Controller.login);

//USER DETAILS
userRouter.get("/users", isAuthenticated, isAdmin, Controller.getUsers);
userRouter.get("/users/:id", isAuthenticated, isAdmin, Controller.getUser);
userRouter.delete("/users", isAuthenticated, isAdmin, Controller.deleteUsers);
userRouter.delete(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  Controller.deleteUser
);

//USER PROMOTION
userRouter.put(
  "/users/:userId/promote",
  isAuthenticated,
  isSuperUser,
  Controller.promoteUser
);

module.exports = userRouter;
