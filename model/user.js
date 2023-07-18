const { mongoose, Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    avatar: {
      type: String,
    },
    googleId: {
      type: String,
    },
    department: {
      type: String,
    },
    level: {
      type: String,
    },
    cloudinaryId: {
      type: "string",
    },
    gradePoints: {
      type: Schema.Types.ObjectId,
      ref: "GradePoint",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superuser"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

module.exports = User;