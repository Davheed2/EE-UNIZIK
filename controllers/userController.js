const jwt = require("jsonwebtoken");
const passport = require("../passport");
const User = require("../model/user");
//REMEMBER TO ADD THE SECURE TRUE PROPERTY TO THE COOKIE WHEN DEPLOYING

exports.signup = async (req, res) => {
  const { email, password, firstName, lastName, level, department } = req.body;

  if (!email || !password || !firstName || !lastName || !level) {
    return res.status(400).json({ message: "Fill in the required fields." });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(401)
        .json({ message: "A user with the given email exists" });
    } else {
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        level,
        department,
      });

      const token = jwt.sign({ _id: user._id }, process.env.ACCESS_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("jwtToken", token, { httpOnly: true });

      const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: "30d" }
      );
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      return res
        .status(201)
        .json({ message: "User registered successfully!.", token });
    }
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    passport.authenticate("local", { session: false }, (err, user) => {
      if (err) {
        return res.status(401).json({ err: err.message });
      }

      if (!user) {
        return res.status(401).json({ message: "Incorrect Email or Password" });
      }

      req.login(user, { session: false }, async (err) => {
        if (err) return res.status(500).json({ message: "Login Failed" });

        const token = jwt.sign({ _id: user._id }, process.env.ACCESS_SECRET, {
          expiresIn: "1h",
        });
        res.cookie("jwtToken", token, { httpOnly: true });
        //ADD THIS WHEN IN PRODUCTION and also add the maxAge property
        //res.cookie("jwtToken", token, { httpOnly: true, secure: true });

        //VERIFY WHETHER YOU SHOULD GIVE A USER A NEW REFRESH TOKEN ON LOGIN///////////////////////
        const refreshToken = jwt.sign(
          { _id: user._id },
          process.env.REFRESH_SECRET,
          { expiresIn: "30d" }
        );
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        return res.json({
          message: "You are successfully logged in!",
          token: token,
        });
      });
    })(req, res);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

exports.protected = async (req, res) => {
  console.log(req.user);
  const user = await User.findById(req.user._id);
  return res.json({ user, message: "Protected route" });
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwtToken", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not provided." });
  }

  try {
    const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Check if the decoded token is valid and not expired
    if (!decodedUser || decodedUser.exp * 1000 < Date.now()) {
      return res
        .status(401)
        .json({ message: "Refresh token is invalid or expired." });
    }

    const newAccessToken = jwt.sign(
      { _id: decodedUser._id },
      process.env.ACCESS_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("jwtToken", newAccessToken, { httpOnly: true });

    return res.status(200).json({
      message: "New access token generated successfully.",
      token: newAccessToken,
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

// exports.googleLogin = (req, res) => {
//   passport.authenticate("google", { scope: ["profile"] });
// };

// exports.googleLoginHome = (req, res) => {
//   passport.authenticate("google", {
//     successRedirect: "/auth/protected",
//     failureRedirect: "/login",
//   });
//   // function (req, res) {
//   //   //Successful authentication, redirect home.
//   //   res.send("google auth");
//   // };
// };

// exports.googleLoginSuccess = (req, res) => {
//   let name = req.user.displayName;
//   res.send(`Hello ${name}`);
// };

// exports.googleLoginFailure = (req, res) => {
//   res.send("something went wrong!");
// };

//////ALL USERS/////////////
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ error: "No user found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    const user = await User.deleteMany();
    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    res.status(200).json({ message: "Users deleted" });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

///////SPECIFIC USERS/////////////
exports.getUser = async (req, res) => {
  try {
    //Find the user by its given ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.editUser = async (req, res) => {
  const userId = req.user._id;

  const updatedUserData = req.body;

  User.findByIdAndUpdate(userId, updatedUserData, { new: true })
    .then((updatedUser) => {
      console.log(updatedUser);
    })
    .catch((err) => {
      console.log(err);
    });
  return res.status(200).json({ message: "user updated successfully" });
};

exports.deleteUser = async (req, res) => {
  try {
    //Find and delete a user by its given ID
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

///////SPECIFIC USERS PROFILE PICTURES//////////////
exports.getProfile = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's avatar URL
    res.status(200).json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while retrieving the profile picture",
    });
  }
};

exports.postProfile = async (req, res) => {
  try {
    const id = req.user._id;

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's avatar field with the Cloudinary URL
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while uploading the profile picture" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const id = req.user._id;

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user's avatar from Cloudinary
    const publicId = user.avatar ? user.avatar.public_id : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Update the user's avatar field to null
    user.avatar = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the profile picture" });
  }
};

///////////USER ENABILITY AND DISABILITY//////////////////
exports.enableUser = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  try {
    // Find the user by ID
    const user = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .send("Only admins and super users can enable users");
    }

    // Enable the user
    user.isActive = true;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User enabled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.disableUser = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  try {
    // Find the user by ID
    const user = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
      return res
        .status(403)
        .send("Only admins and super users can disable users");
    }

    // Disable the user
    user.isActive = false;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

////////SUPER USER ROUTE//////////////
exports.promoteUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(currentUserId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser") {
      return res.status(403).send("Only superusers can promote users");
    }

    //update the target user's role to an admin user
    targetUser.role = "admin";

    await targetUser.save();

    res.status(200).json({ message: "User promoted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.demoteUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(currentUserId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser") {
      return res.status(403).send("Only superusers can promote users");
    }

    //update the target user's role to an admin user
    targetUser.role = "user";

    await targetUser.save();

    res.status(200).json({ message: "User demoted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

///////////////////OPTIONAL/////////////////////
exports.deleteAccount = async (req, res) => {
  try {
    //Find and delete a user by its given ID
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ error: err.message });
  }
};
