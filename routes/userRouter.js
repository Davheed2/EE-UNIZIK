const express = require("express");
const userRouter = express.Router();
const Controller = require("../controllers/userController");
const passport = require("passport");

//USER AUTHENTICATION
userRouter.get("/users/logout", Controller.logout);
//userRouter.get("/auth/google", Controller.googleLogin);
//userRouter.get("/auth/google/callback", Controller.googleLoginHome);
userRouter.post("/users/register", Controller.register);
userRouter.post("/users/login", Controller.login);

//USER DETAILS
userRouter.get("/users", Controller.getUsers);
userRouter.get("/users/:id", Controller.getUser);
userRouter.delete("/users",  Controller.deleteUsers);
userRouter.delete("/users/:id",  Controller.deleteUser);

//USER PROMOTION
userRouter.put("/users/:userId/promote",  Controller.promoteUser);

module.exports = userRouter;