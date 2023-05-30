const { Schema, mongoose } = require("mongoose");

const pdfSchema = new Schema(
  {
    fileName: {
      type: String
    },
    url: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const Pdf = mongoose.model("Pdf", pdfSchema);

module.exports = Pdf;
