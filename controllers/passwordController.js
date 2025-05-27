const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Retailer = require("../models/Retailer");
const { sendMail } = require("../utils/sendMail");

exports.changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const retailer = await Retailer.findById(decoded.id);
    if (!retailer)
      return res.status(404).json({ message: "Retailer not found" });

    const { oldPassword, newPassword } = req.body;

    //  Verify old password
    const isMatch = await bcrypt.compare(oldPassword, retailer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    //   password strength
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;
    if (!strongRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    retailer.password = await bcrypt.hash(newPassword, 10);
    await retailer.save();

    // send email confirmation
    // await sendMail(retailer.email, "Your password was successfully changed.");

    const fullName = `${retailer.firstName} ${retailer.lastName}`;

    await sendMail(
      retailer.email,
      "Your Password Has Been Successfully Changed",
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Hello ${fullName || retailer.email},</h2>
      <p>Your password has been <strong>successfully changed</strong>.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
      <br/>
      <p>Best regards,<br/>Vadik.Ai Team</p>
    </div>
  `
    );

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// forgot password sendlink through email

exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic input validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const retailer = await Retailer.findOne({ email });

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    const token = jwt.sign({ id: retailer._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5000/reset-password/${token}`;
    const fullName = `${retailer.firstName} ${retailer.lastName}`;

    await sendMail(
      email,
      "Reset Your Password",
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Hi ${fullName || retailer.email},</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display:inline-block; padding:10px 20px; color:white; background-color:#007bff; border-radius:5px; text-decoration:none;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request a password reset, you can safely ignore this email.</p>
        <br/>
        <p>Regards,<br/>Vadik.Ai Support Team</p>
      </div>
    `
    );

    res.json({ message: "Reset link sent to email" });

  } catch (error) {
    console.error("Error sending reset link:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};


// reset password

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const retailer = await Retailer.findById(decoded.id);
    if (!retailer)
      return res.status(404).json({ message: "Retailer not found" });

    // password strength

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;
    if (!strongRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }
    retailer.password = await bcrypt.hash(newPassword, 10);
    await retailer.save();

    const fullName = `${retailer.firstName} ${retailer.lastName}`;

    // Send confirmation email
    await sendMail(
      retailer.email,
      "Your Password Has Been Reset",
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hello ${fullName || retailer.email},</h2>
          <p>This is a confirmation that your password has been successfully reset.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <br/>
          <p>Best regards,<br/>Vadik.Ai Team</p>
        </div>
      `
    );

    // await sendMail(retailer.email, "Your password was successfully reset.");

    res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
