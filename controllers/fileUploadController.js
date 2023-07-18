const Pdf = require("../model/fileUpload");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const client = require("../config/awsconfig");
const fs = require("fs");
const gm = require("gm");
const { DownloaderHelper } = require("node-downloader-helper");
const {
  DeleteObjectsCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

//code for coverting manaully on the command line using graphicsmagick and ghostscript package
//gm convert -resize 300 1688609902284-Stacking%20Order%20Flowchart%20v2.1.pdf resized300.png

// Function to generate the PDF thumbnail using pdf2pic library
async function generateThumbnail(pdfPath, thumbnailDir, thumbNailName) {
  //console.log("generating");
  return new Promise((resolve, reject) => {
    gm(pdfPath)
      .resize(400, 400) // Adjust the width and height as needed
      .setFormat("jpeg") // Set the output format
      .write(path.join(thumbnailDir, thumbNailName), (err) => {
        console.log("generating");
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

// Function to upload the PDF thumbnail to Cloudinary
async function uploadThumbnailToCloudinary(thumbnailPath) {
  try {
    const uploadResult = await cloudinary.uploader.upload(thumbnailPath, {
      folder: "pdf-thumbnails",
    });
    return uploadResult.secure_url;
  } catch (error) {
    throw error;
  }
}

exports.postPdf = async (req, res) => {
  try {
    // Create a folder for PDFs if it doesn't exist
    const pdfFolderPath = path.join(__dirname, "pdfs");
    const thumbnailDir = path.join(__dirname, "thumbs");

    if (!fs.existsSync(pdfFolderPath)) {
      fs.mkdirSync(pdfFolderPath);
    }

    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir);
    }

    const thumbNailName = `${req.file.originalname}-thumbnail.jpg`;

    const dl = new DownloaderHelper(req.file.location, pdfFolderPath);
    dl.on("end", async (pdfData) => {
      await Pdf.create({
        filename: req.file.key,
        originalname: req.file.originalname,
        url: req.file.location,
        level: req.body.level,
        semester: req.body.semester,
        topic: req.body.topic,
        admin: req.user._id
      });

      await generateThumbnail(
        path.join(pdfFolderPath, pdfData.fileName),
        thumbnailDir,
        thumbNailName
      );

      console.log("after generating thumbnail");

      //return res.json({ msg: "ok" });
      //Upload the PDF thumbnail to Cloudinary
      const thumbnailPath = path.join(thumbnailDir, thumbNailName);

      const thumbnailUrl = await uploadThumbnailToCloudinary(thumbnailPath);
      console.log("cloudinary thumbnail");

      //Update the PDF document in MongoDB with the thumbnail URL
      await Pdf.updateOne(
        { filename: req.file.key },
        { $set: { thumbnailUrl: thumbnailUrl } }
      );

      //Delete the temporary thumbnail file
      fs.unlinkSync(path.join(pdfFolderPath, pdfData.fileName));
      fs.unlinkSync(thumbnailPath);

      return res.status(201).json({ message: "File uploaded successfully" });
    });

    dl.on("error", (err) => console.log("Download Failed", err));
    console.log("idiot");
    dl.start().catch((err) => console.error(err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPdf = async (req, res) => {
  try {
    // Retrieve all files from MongoDB
    const files = await Pdf.find().sort({ createdAt: -1 });

    if (!files) {
      return res.status(404).json({ message: "No Pdf found" });
    }
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllPdf = async (req, res) => {
  try {
    // Retrieve all files from MongoDB
    const files = await Pdf.find();

    if (files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }

    // Collect all S3 object keys to delete
    const objectKeys = files.map((file) => ({ Key: file.filename }));

    // Delete files from AWS S3
    await client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.BUCKET,
        Delete: { Objects: objectKeys },
      })
    );

    // Delete files from MongoDB
    await Pdf.deleteMany();

    return res.json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPdf = async (req, res) => {
  const fileId = req.params.pdfId;

  try {
    // Find the file by its id
    const file = await Pdf.findById(fileId);

    if (!file) {
      res.status(404).send("File not found.");
    }

    return res.status(200).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: error.message });
  }
};

exports.deletePdf = async (req, res) => {
  const fileId = req.params.pdfId;

  try {
    // Find the file in MongoDB
    const file = await Pdf.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete the file from AWS S3
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET,
        Key: file.filename,
      })
    );

    // Delete the file from MongoDB
    await Pdf.deleteOne(file);

    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
