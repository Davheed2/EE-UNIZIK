const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../model/user");

//check if you will use the req.user instead of the req.body.email.
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email address exists." });
    }

    // Generate a reset token
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error." });
      }

      const token = buffer.toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send reset email
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
        to: user.email,
        from: process.env.GMAIL_USER,
        subject: "Complete your password reset request",
        html: `<div style="background-color: #1a1a1a; padding: 5%; line-height: 2">
                                <h1 style= "font-size: 35px; color: white">Reset your password</h1>
                                <h3 style="color: white">Hi ${user.firstName},</h3>
                                <p style="color: white; font-size: 15px">You are receiving this email because you (or someone else) has requested the reset of the password for your account. please click on the link below or paste it into your browser to complete the process</p>
                                <button style="background-color: #148aff; width: 100%; color: white; padding: 15px 24px; border: none; border-radius: 4px;"><a href="${req.headers.host}/reset-password/${token}" style="color: white; text-decoration: none;">Reset Password</a></button><br>
                                <p style="color: white; font-size: 15px">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                                <p style="color: white; font-size: 15px">We're here to help if you need it. <a href="https://wa.me/+2349154064012" style="color: #fff; text-decoration: underline;">contact us</a> for more info.</p>
                                <h3 style="color: white">Davheed</h3>
                              </div>`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Failed to send reset email." });
        }
        return res.json({
          message: `Email Sent, An email has been sent to
                           ${user.email} with further instructions
                           on how to reset your password. Check your spam
                           or junk folder if you don't see the email in
                           your inbox.`,
        });
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.renderPasswordResetForm = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    // Render your password reset form here
    // res.render("resetPasswordForm", { token: req.params.token });

    // Alternatively, you can return JSON response
    res.json({ token: req.params.token });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const { newPassword } = req.body;

    // Set the new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    // Respond with success message
    res.status(201).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
