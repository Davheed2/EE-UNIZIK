const { Schema, mongoose } = require("mongoose");

const pdfSchema = new Schema(
  {
    filename: {
      type: String
    },
    originalname: {
      type: String
    },
    url: {
      type: String
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
  },
  {
    timestamps: true,
  }
);

const Pdf = mongoose.model("Pdf", pdfSchema);

module.exports = Pdf;
