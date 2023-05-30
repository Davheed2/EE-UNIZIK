const { mongoose, Schema } = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//const findOrCreate = require("mongoose-findorcreate");

const userSchema = new Schema(
  {
    firstName: {
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
    gradePoints: {
      type: Schema.Types.ObjectId,
      ref: "GradePoint",
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
//userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = User;
