const User = require("../model/user");
const passport = require("passport");

exports.register = (req, res) => {
  //const username = req.body.username
  const password = req.body.password;
  const user = req.body;

  ///check if he uses small and capital letters

  //Register a new user using the local strategy
  //Passportjs requires 3 objects, the first and second are the user details while the third is the callback function
  //in the frontend validate their usename by changing the username to lower case before passing them to the database
  User.register(new User(user), password, (err) => {
    if (err) {
      res.status(400).json({ err: err.message });
    } else {
      passport.authenticate("local")(req, res, () => {
        res.setHeader("Content-Type", "application/json");
        res
          .status(200)
          .json({ success: true, message: "Registration Successful", user });
        // res.redirect("/login");
      });
    }
  });
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.statusCode = 500;
      res.json({ err: err.message });
      return next(err);
    }
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Account does not exist" });
      //res.redirect("/register")
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ status: true, message: "Login successful", user });
      //return res.redirect("/register");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      res.status(500).json({ err: err });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, message: "Logout Successful" });
    }
  });
};

exports.home = (req, res) => {
  res.sendFile("/index.html");
};
exports.googleLogin = (req, res) => {
  passport.authenticate("google", { scope: ["profile"] });
};

exports.googleLoginHome = (req, res) => {
  passport.authenticate("google", {
    successRedirect: "/auth/protected",
    failureRedirect: "/login",
  });
  // function (req, res) {
  //   //Successful authentication, redirect home.
  //   res.send("google auth");
  // };
};

exports.googleLoginSuccess = (req, res) => {
  let name = req.user.displayName;
  res.send(`Hello ${name}`);
};

exports.googleLoginFailure = (req, res) => {
  res.send("something went wrong!");
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    const user = await User.deleteMany();
    if (!user) {
      return res.status(404).send("No user found");
    }
    res.send("Users deleted");
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

/////////////////SPECIFIC USERS////////////////////////////////
exports.getUser = async (req, res) => {
  try {
    //Find the user by its given ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send({ user });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    //Find and delete a user by its given ID
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("user not found");
    }
    res.send("User deleted");
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, username, level } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the firstName and lastName fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.level = level;

    // Save the updated user
    await user.save();

    res.json({ message: "User details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's avatar URL
    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "An error occurred while retrieving the profile picture",
      });
  }
};

exports.postProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's avatar field with the Cloudinary URL
    user.avatar = req.file.path;
    await user.save();

    res.json({
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
    const { id } = req.params;

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

    res.json({ success: true, message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the profile picture" });
  }
}

///////////////USER DISABILITY////////////////////////////////
exports.enableUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(id);

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

  try {
    // Find the user by ID
    const user = await User.findById(id);

    // Disable the user
    user.isActive = false;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

/////////SUPER USER LOG////////////
exports.promoteUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const targetUser = await User.findById(req.params.userId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser") {
      return res.status(403).send("Only superusers can promote users");
    }

    //update the target user's role to an admin user
    targetUser.role = "admin";

    await targetUser.save();

    res.send("User promoted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.demoteUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const targetUser = await User.findById(req.params.userId);

    //check if the current user is a superuser
    if (currentUser.role !== "superuser") {
      return res.status(403).send("Only superusers can promote users");
    }

    //update the target user's role to an admin user
    targetUser.role = "user";

    await targetUser.save();

    res.send("User demoted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
