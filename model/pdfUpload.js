const { Schema, mongoose } = require("mongoose");

const pdfSchema = new Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    avatar: {
        type: String
    },
    cloudinaryId: {
        type: String
    }
},{
    timestamps: true
});

const Pdf = mongoose.model("Pdf", pdfSchema);

module.exports = Pdf;