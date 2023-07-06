const multer = require("multer");

//Multer setup
const path = require("path");
const { v2 } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "profile-pictures", // Optional folder for storing profile pictures
  },
});

const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 512000 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".gif" &&
      ext !== ".PNG" &&
      ext !== ".JPG" &&
      ext !== ".JPEG" &&
      ext !== ".GIF" 
    ) {
      return cb(new Error("Only images are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = uploadAvatar;