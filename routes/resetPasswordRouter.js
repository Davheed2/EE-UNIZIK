const express = require("express");
const resetRouter = express.Router();
const resetController = require("../controllers/resetPasswordController");

const checkActiveStatus = async (req, res, next) => {
  const { user } = req;

  // Check if the user is not active
  if (user && !user.isActive) {
    return res.status(403).json({ error: "User deactivated. Contact admin for more support" });
  }

  // If the user is active, proceed to the next middleware
  next();
};

resetRouter.get("/reset-password", resetController.getReset);
resetRouter.post("/reset-password", resetController.postReset);
resetRouter.get("/reset-password/:token", resetController.getResetToken);
resetRouter.post("/reset-password/:token", resetController.postResetToken);

module.exports = resetRouter;
