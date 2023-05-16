const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Pdf = require("../model/pdfUpload");

exports.postPdf = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        //create instance of pdf object
        let newPdf = new Pdf({
            //admin: req.user.id,
            avatar: result.secure_url,
            cloudinaryId: result.public_id
        });

        //save new pdf object
        await newPdf.save();
        res.json(newPdf);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
}

exports.getPdf = async (req, res) => {
    try {
        const pdf = await Pdf.find();
        res.json(pdf);
    } catch (error) {
        console.log(error);
    }
}

