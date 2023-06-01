const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../model/user");

exports.getReset = (req, res) => {
  //res.render("resetPasswordForm");
  res.send("reset form");
};

// Reset Password Route
//In this example, when a user submits their email to request a password reset, a unique token is generated using crypto.randomBytes.
//This token is then saved to the user's resetPasswordToken field in the database along with an expiration time (resetPasswordExpires).
//An email is then sent to the user's email address with a link that includes the token as a parameter. When the user clicks on the link,
//they will be directed to a page where they can enter a new password. The server will verify that the token is valid and has not expired,
//and if so, update the user's password and clear the resetPasswordToken and resetPasswordExpires fields in the database.
//Note that this example assumes that you have already set up a route for the page where users can enter a new password, and that the route
//for this page is /reset-password/:token. The code for this route is not included in this example as it will depend on your specific implementation.

exports.postReset = async (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      //return res.redirect("/login");
    }

    const token = buffer.toString("hex");

    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.status(404).send("No account with that email address exists.");
        return res.redirect("/reset-password");
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        to: user.username,
        from: process.env.GMAIL_USER,
        subject: "Complete your password reset request",
        html: `<div style="background-color: #1a1a1a; padding: 5%; line-height: 2">
                    <h1 style= "font-size: 35px; color: white">Reset your password</h1>
                    <h3 style="color: white">Hi ${user.firstName},</h3>
                    <p style="color: white; font-size: 15px">You are receiving this email because you (or someone else) has requested the reset of the password for your account. please click on the link below or paste it into your browser to complete the process</p>
                    <button style="background-color: #148aff; width: 100%; color: white; padding: 15px 24px; border: none; border-radius: 4px;"><a href="${req.headers.host}/reset-password/${token}" style="color: white; text-decoration: none;">Reset Password</a></button><br>  
                    <p style="color: white; font-size: 15px">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    <p style="color: white; font-size: 15px">We're here to help if you need it. <a href="https://wa.me/+2349154064012" style="color: #fff; text-decoration: underline;">contact us</a> for more info.</p>
                    <h3 style="color: white">The NUESA team</h3>
                  </div>`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.redirect("/reset-password");
        }

        res.send(
          `Email Sent, An email has been sent to  
            ${user.username} with further instructions
            on how to reset your password. Check your spam
            or junk folder if you don't see the email in
            your inbox.`
        );
        //res.redirect("/reset-password");
      });
    } catch (err) {
      next(err);
    }
  });
};

// Render password reset form

//In this example, the first route renders a form that allows the user to enter a new password.
//The :token parameter is used to look up the user in the database and verify that the token is valid and has not expired.
//If the token is invalid or has expired, the user is redirected to the password reset page with an error message.
//The second route handles the submission of the form and updates the user's password in the database. Again, the :token
//parameter is used to look up the user in the database and verify that the token is valid and has not expired.
//If the token is invalid or has expired, the user is redirected to the password reset page with an error message.
//If the token is valid, the user's password is updated using the setPassword method provided by passport-local-mongoose.
//The resetPasswordToken and resetPasswordExpires fields in the database are then cleared, and the user is logged in and
//redirected to the login route.

exports.getResetToken = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/reset-password");
    }

    res.render("reset-password-form", {
      token: req.params.token,
      message: req.flash("success", "Password reset token"),
    });
    res.json({ token: req.params.token });
  } catch (err) {
    next(err);
  }
};

// Update password
exports.postResetToken = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      res.json({
        status: false,
        message: "Password reset token is invalid or has expired.",
      });
      return res.redirect("/reset-password");
    }

    user.setPassword(req.body.password, (err) => {
      if (err) {
        console.log(err);
        return next(err);
      }

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      user.save((err) => {
        if (err) {
          console.log(err);
          return next(err);
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log(err);
            return next(err);
          }

          res.json({ success: true, message: "Password changed successfully" });
          res.redirect("/login");
        });
      });
    });
  } catch (err) {
    next(err);
  }
};
