const express = require("express");
const resetRouter = express.Router();
const resetController = require("../controllers/resetPasswordController");

resetRouter.get("/reset-password", resetController.getReset);
resetRouter.post("/reset-password", resetController.postReset);
resetRouter.get("/reset-password/:token", resetController.getResetToken);
resetRouter.post("/reset-password/:token", resetController.postResetToken);

module.exports = resetRouter;