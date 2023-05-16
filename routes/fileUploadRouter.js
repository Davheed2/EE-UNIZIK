const express = require("express");
const fileUploadRouter = express.Router();
const fileUploadController = require("../controllers/fileUploadController");
const upload = require("../utils/multer");

fileUploadRouter.get("/upload", fileUploadController.getPdf);
fileUploadRouter.post("/upload", upload.single("pdf"), fileUploadController.postPdf);
//fileUploadRouter.delete("/upload/:pdfId", fileUploadController.deletePdf);
//fileUploadRouter.put("/upload/:pdfId", upload.single("pdf"), fileUploadController.updatePdf);


module.exports = fileUploadRouter;