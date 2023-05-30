const Pdf = require("../model/pdfUpload");
const serviceAccount = require("../serviceAccount.json");
const admin = require("firebase-admin");

//const path = require("path");
//create a new firebase project

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET
});


exports.postPdf = async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const blob = bucket.file(file.originalname);

    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      return res.status(500).json({ error: err.message });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const newPdf = await Pdf.create({
        filename: file.originalname,
        url: publicUrl
      });

      await newPdf.save();
      return res.status(200).send("File uploaded successfully");
      //res.status(200).json({url: publicUrl});
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred while uploading the file");
  }
};

exports.getAllPdf = async (req, res) => {
  try {
    const files = await Pdf.find();
    //.sort({createdAt: -1});

    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving file");
  }
};

exports.deleteAllPdf = async (req, res) => {
  try {
    // Find all files in MongoDB
    const files = await Pdf.find();

    if (files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    // Delete files from Google Cloud Storage
    const bucket = admin.storage().bucket();
    const deletePromises = files.map((file) => bucket.file(file.fileName).delete());
    await Promise.all(deletePromises);

    // Delete files from MongoDB
    await Pdf.deleteMany();

    res.status(200).json({ message: "All pdf files deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the files" });
  }
};

exports.getPdf = async (req, res) => {
  const { pdfId } = req.params;

  try {
    // Find the file by ID in MongoDB
    const pdf = await Pdf.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json(pdf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while finding the file" });
  }
};

exports.deletePdf = async (req, res) => {
  const { pdfId } = req.params;

  try {
    // Find the file by ID in MongoDB
    const pdf = await Pdf.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete the file from Google Cloud Storage
    const bucket = admin.storage().bucket();
    await bucket.file(pdf.fileName).delete();

    // Delete the file from MongoDB
    await Pdf.findByIdAndDelete(pdfId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the file" });
  }
};

exports.updatePdf = async (req, res) => {
  const { pdfId } = req.params;
  const { fileName, url } = req.body;

  try {
    // Find the file by ID in MongoDB
    const pdf = await Pdf.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({ error: "File not found" });
    }

    // Update the file in Google Cloud Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(pdf.fileName);
    await file.move(fileName);

    // Update the file in MongoDB
    pdf.fileName = fileName;
    pdf.url = url;
    await pdf.save();

    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the file" });
  }
};

















// const { Storage } = require("@google-cloud/storage");



// exports.postPdf = async (req, res) => {
//   try {
//     //console.log(req.file);
//     //create instance of pdf object
//     // const newPdf = await Pdf.create({
//     //   //admin: req.user.id,
//     //   avatar: req.file.path,
//     //   cloudinaryId: req.file.filename,
//     // });
//     const uploadedMedia = await uploadMedia(req.file, "test");

//     console.log(uploadedMedia);
//     //save new pdf object
//     return res.json(newPdf);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getAllPdf = async (req, res) => {
//   try {
//     const pdf = await Pdf.find();
//     return res.json(pdf);
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.postPdf = async (req, res) => {
//   try {
//     console.log(req.file);
//     //create instance of pdf object
//     const newPdf = await Pdf.create({
//       //admin: req.user.id,
//       avatar: req.file.path,
//       cloudinaryId: req.file.filename,
//     });

//     //save new pdf object
//     return res.json(newPdf);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.updatePdf = async (req, res) => {
//   try {
//     let pdf = await Pdf.findById(req.params.pdfId);

//     if (!pdf) {
//       return res.json({ message: "No PDF found" });
//     }

//     const data = await Pdf.findByIdAndUpdate(
//       req.params.pdfId,
//       {
//         //admin: req.user._id || pdf.admin,
//         avatar: req.file.path,
//         cloudinaryId: req.file.filename,
//       },
//       { new: true }
//     );

//     return res.json(data);
//   } catch (error) {
//     console.log(error);
//   }
// };
