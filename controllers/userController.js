const User = require("../model/user");
const passport = require("passport");

exports.register = (req, res) => {
  //const username = req.body.username
  const password = req.body.password;
  const user = req.body;

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

exports.googleLogin = (req, res) => {
  passport.authenticate("google", { scope: ["profile"] });
};

exports.googleLoginHome = (req, res) => {
  passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      //Successful authentication, redirect home.
      res.send("google auth");
    };
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).send(error);
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
    res.status(500).send(error);
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
    res.status(500).send(error);
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
    res.status(500).send(error);
  }
};

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
    res.status(500).send("Internal Server Error");
  }
};
