const express = require("express");
const resetRouter = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("../passport");
const resetPasswordController = require("../controllers/resetPasswordController");

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
      return res
        .status(401)
        .json({ message: "Refresh token is invalid or expired." });
    }

    req.user = decoded;

    next();
  });
}

function checkActiveStatus(req, res, next) {
  const { user } = req;

  // Check if the user is not active
  if (user && !user.isActive) {
    return res.status(403).json({ error: "User deactivated. Contact admin for more support" });
  }

  // If the user is active, proceed to the next middleware
  next();
};

// Route to request a password reset
resetRouter.post("/reset-password-request", resetPasswordController.requestPasswordReset);

// Route to render the password reset form
resetRouter.get("/reset-password/:token", resetPasswordController.renderPasswordResetForm);

// Route to handle password reset form submission
resetRouter.post("/reset-password/:token", resetPasswordController.resetPassword);



module.exports = resetRouter;
