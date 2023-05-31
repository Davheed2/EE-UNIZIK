const multer = require("multer");
const multerS3 = require("multer-s3");
const client = require("./awsconfig");

const upload = multer({
  storage: multerS3({
    s3: client,
    bucket: process.env.BUCKET,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname})
    },
    key: (req, file, cb) =>{
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});


module.exports = upload;