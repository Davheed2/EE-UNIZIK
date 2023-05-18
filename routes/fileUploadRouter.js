const express = require("express");
const fileUploadRouter = express.Router();
const fileUploadController = require("../controllers/fileUploadController");
const upload = require("../utils/multer");


fileUploadRouter.get("/upload", fileUploadController.getAllPdf);




fileUploadRouter.post("/upload", upload.single("file"), fileUploadController.postPdf);





fileUploadRouter.delete("/upload", fileUploadController.deleteAllPdf);

fileUploadRouter.get("/upload/:pdfId", fileUploadController.getApdf);
fileUploadRouter.delete("/upload/:pdfId", fileUploadController.deletePdf);
fileUploadRouter.put("/upload/:pdfId", upload.single("file"),fileUploadController.updatePdf);


module.exports = fileUploadRouter;