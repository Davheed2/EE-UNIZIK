const { mongoose, Schema } = require("mongoose");

const GradePointSchema = new Schema({
  subject: {
    type: String,
    required: true
  },
  creditUnits: {
    type: Number,
    required: true
  },
  calculatedGp: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const GradePoint = mongoose.model("GradePoint", GradePointSchema);

module.exports = GradePoint;