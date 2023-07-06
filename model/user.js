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
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/ee-unizik",
//       userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
//     },
//     function (request, accessToken, refreshToken, profile, done) {
//       User.findOrCreate({ googleId: profile.id }, function (err, user) {
//         return done(err, user);
//       });
//     }
//   )
// );

// passport.use(User.createStrategy());
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });
