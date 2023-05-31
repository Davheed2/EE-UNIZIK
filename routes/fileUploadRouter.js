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

fileUploadRouter.get("/upload", fileUploadController.getAllPdf);
fileUploadRouter.post("/upload", upload.single("file"), fileUploadController.postPdf);
fileUploadRouter.delete("/upload", fileUploadController.deleteAllPdf);

fileUploadRouter.get("/upload/:pdfId", fileUploadController.getPdf);
fileUploadRouter.delete("/upload/:pdfId", fileUploadController.deletePdf);

module.exports = fileUploadRouter;
