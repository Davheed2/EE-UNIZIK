const express = require("express");
const userRouter = express.Router();
const Controller = require("../controllers/userController");
const uploadAvatar = require("../config/multerCloud");
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

const checkActiveStatus = async (req, res, next) => {
  const { user } = req;

  // Check if the user is not active
  if (user && !user.isActive) {
    return res.status(403).json({ error: "User deactivated. Contact admin for more support" });
  }

  // If the user is active, proceed to the next middleware
  next();
};

//USER AUTHENTICATION
userRouter.get("/users/logout", Controller.logout);
userRouter.get("/", Controller.home);

userRouter.get("/auth/google", Controller.googleLogin);
userRouter.get("/auth/google/callback", Controller.googleLoginHome);
//userRouter.get("/auth/protected", isAuthenticated, Controller.googleLoginSuccess);
//userRouter.get("/login", isAuthenticated, Controller.googleLoginFailure);

userRouter.post("/users/register", Controller.register);
userRouter.post("/users/login", checkActiveStatus, Controller.login);



//USER DETAILS
userRouter.get("/users", Controller.getUsers);
userRouter.get("/users/:id", isAuthenticated, isAdmin, Controller.getUser);
userRouter.put("/users/:id", isAuthenticated, Controller.editUser);
userRouter.delete("/users", isAuthenticated, isAdmin, Controller.deleteUsers);
userRouter.delete("/users/:id", isAuthenticated, isAdmin, Controller.deleteUser);



//USER PROFILE PICS
userRouter.get("/users/:id/avatar", isAuthenticated, Controller.getProfile);
userRouter.put("/users/:id/avatar", uploadAvatar.single("avatar"), isAuthenticated, Controller.postProfile);
userRouter.delete("/users/:id/avatar", isAuthenticated, Controller.deleteProfile);



//USER PROMOTION
userRouter.put(
  "/users/:userId/promote",
  isAuthenticated,
  isSuperUser,
  Controller.promoteUser
);
userRouter.put(
  "/users/:userId/demote",
  isAuthenticated,
  isSuperUser,
  Controller.demoteUser
);

//USER ENABILITY
userRouter.put("/users/:id/disable", isAuthenticated, Controller.disableUser);
userRouter.put("/users/:id/enable", isAuthenticated, Controller.enableUser);

module.exports = userRouter;
