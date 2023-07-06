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
    level: {
      type: Number
    },
    semester: {
      type: String
    },
    topic: {
      type: String
    },
    thumbnailUrl: {
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
