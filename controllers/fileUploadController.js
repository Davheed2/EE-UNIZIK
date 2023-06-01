const Pdf = require("../model/pdfUpload");
const { S3Client, ListObjectsCommand, DeleteObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const client = require("../config/awsconfig");

//console.log(S3Client);

//MAKING 5 ACCOUNTS FOR EACH DEPARTMENT

exports.postPdf = async (req, res) => {
  try {
    //console.log(req.file);
    await Pdf.create({
      filename: req.file.key,
      originalname: req.file.originalname,
      url: req.file.location,
      //admin: req.user._id
    });

    return res.status(201).json({ message: "File uploaded successfully" });
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
      return res.status(404).json({message: "No Pdf found"})
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
        Delete: { Objects: objectKeys }
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
    // Find the file in MongoDB by ID
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
        Key: file.filename
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













// const bucketName = process.env.BUCKET;
// const newFileNameKey = "file.pdf";
// const filePath = `${__dirname}/Data Structures.pdf`;

// function uploadFile(filePath, bucketName, newFileNameKey) {
//   const fileStream = fs.createReadStream(filePath);
//   fileStream.on("error", (err) => {
//     console.log("File Error:", err);
//   })

//   const params = {
//     Bucket: bucketName,
//     Key: newFileNameKey,
//     Body: fileStream,
//     ACL: "public-read"
//   };

//   s3.upload(params, (err, data) => {
//     if (err) {
//       console.log("Error:", err);
//     }
//     if (data) {
//       console.log("Success:", data.Location);
//     }
//   })
// }

// uploadFile(filePath, bucketName, newFileNameKey);
