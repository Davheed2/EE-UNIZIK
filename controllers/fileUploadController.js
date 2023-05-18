const Pdf = require("../model/pdfUpload");
const path = require("path");

exports.getAllPdf = async (req, res) => {
  try {
    const pdf = await Pdf.find();
    return res.json(pdf);
  } catch (error) {
    console.log(error);
  }
};

exports.postPdf = async (req, res) => {
  try {
    console.log(req.file[0]);

    //create instance of pdf object
    const newPdf = await Pdf.create({
      //admin: req.user.id,
      avatar: req.file.path,
      cloudinaryId: req.file.filename,
    });

    //save new pdf object
    return res.json("newPdf");
  } catch (err) {
    console.log(err);
  }
};

exports.deleteAllPdf = async (req, res) => {
  try {
    const pdf = await Pdf.deleteMany();

    //Check if the any pdf exists
    if (!pdf) {
      return res.status(404).send("No pdf found");
    }

    return res.status(200).json({ message: "All pdf's deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getApdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.pdfId);

    if (!pdf) {
      return res.status(404).json({ message: "pdf not found" });
    }

    return res.json(pdf);
  } catch (error) {
    console.log(error);
  }
};

exports.deletePdf = async (req, res) => {
  try {
    //find the pdf file by its ID
    let pdf = await Pdf.findById(req.params.pdfId);

    if (!pdf) {
      return res.status(404).json({ message: "pdf not found" });
    }

    //delete the pdf file from database
    await Pdf.deleteOne({ _id: req.params.pdfId });
    return res.json({ message: "pdf deleted" });
  } catch (error) {
    return console.log(error);
  }
};

exports.updatePdf = async (req, res) => {
  try {
    let pdf = await Pdf.findById(req.params.pdfId);

    if (!pdf) {
      return res.json({ message: "No PDF found" });
    }

    const data = await Pdf.findByIdAndUpdate(
      req.params.pdfId,
      {
        //admin: req.user._id || pdf.admin,
        avatar: req.file.path,
        cloudinaryId: req.file.filename,
      },
      { new: true }
    );

    return res.json(data);
  } catch (error) {
    console.log(error);
  }
};
