const express = require("express");
const fileUploadRouter = express.Router();
const fileUploadController = require("../controllers/fileUploadController");
const upload = require("../config/multer");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};

const isAdmin = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.role.includes("admin")) ||
    req.user.role.includes("superuser")
  ) {
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

fileUploadRouter.get("/upload", fileUploadController.getAllPdf);
fileUploadRouter.post("/upload", upload.single("file"), fileUploadController.postPdf);
fileUploadRouter.delete("/upload", isAuthenticated, isAdmin, fileUploadController.deleteAllPdf);

fileUploadRouter.get("/upload/:pdfId", fileUploadController.getPdf);
fileUploadRouter.delete("/upload/:pdfId", isAuthenticated, isAdmin, fileUploadController.deletePdf);

module.exports = fileUploadRouter;
