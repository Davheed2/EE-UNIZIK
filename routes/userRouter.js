const express = require("express");
const jwt = require("jsonwebtoken");
const userRouter = express.Router();
const passport = require("../passport");
const userController = require("../controllers/userController");

const verifyUser = passport.authenticate("jwt", { session: false });

function checkTokenExpiry(req, res, next) {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    req.user = decoded;
    next();
  });
}

function checkRefreshTokenExpiry(req, res, next) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No refresh token provided." });
  }

  jwt.verify(token, process.env.REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Refresh token is invalid or expired." });
    }

    req.user = decoded;

    next();
  });
}

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGY1MTZlOTFhMmY1ZWZhMWZhNjI3NjgiLCJpYXQiOjE2OTQzNzIyMjEsImV4cCI6MTY5NDM3NTgyMX0.5ndlnEumb02s2i_AHPIj6sL9MgiqJBFlQ_W2Z-ugo8Y


userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/logout", verifyUser, userController.logout)
userRouter.get("/protected", verifyUser, checkTokenExpiry, userController.protected);
userRouter.post("/refresh-token", checkRefreshTokenExpiry, userController.refreshToken);


//ALL USER DETAILS
userRouter.get("/users", verifyUser, checkTokenExpiry, userController.getUsers);
userRouter.delete("/users", verifyUser, checkTokenExpiry, userController.deleteUsers);

//SPECIFIC USER DETAILS
userRouter.get("/user/:id", verifyUser, checkTokenExpiry, userController.getUser);
userRouter.put("/user", verifyUser, checkTokenExpiry, userController.editUser);
userRouter.delete("/user/:id", verifyUser, checkTokenExpiry, userController.deleteUser);
//verifyUser, checkTokenExpiry, 


////SPECIFIC USER PROFILES PICTURES//////////
userRouter.get("/users/avatar", verifyUser, checkTokenExpiry, userController.getProfile);
//userRouter.put("/users/avatar", uploadAvatar.single("avatar"), verifyUser, checkTokenExpiry, userController.postProfile);
userRouter.delete("/users/avatar", verifyUser, checkTokenExpiry, userController.deleteProfile);


///////////USER ENABILITY AND DISABILITY//////////////////
userRouter.put("/users/:id/enable", verifyUser, checkTokenExpiry, userController.enableUser);
userRouter.put("/users/:id/disable", verifyUser, checkTokenExpiry, userController.disableUser);


////////SUPER USER ROUTE//////////////
userRouter.put("/users/:id/promote", verifyUser, checkTokenExpiry, userController.promoteUser);
userRouter.put("/users/:id/demote", verifyUser, checkTokenExpiry, userController.demoteUser);

/////////////OPTIONAL///////////////////
userRouter.delete("/profile", verifyUser, checkTokenExpiry, userController.deleteAccount);

module.exports = userRouter;

