const jwt = require("jsonwebtoken");
const Retailer = require("../models/Retailer");
const { sendMail } = require("../utils/sendMail");

const otpStore = new Map(); // Replace with Redis/db in production

// Send 6-digit OTP to email or phone
exports.sendOTP = async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) return res.status(400).json({ message: "Email or phone is required" });

  const isPhone = /^\d{10}$/.test(identifier);
  const isEmail = /^\S+@\S+\.\S+$/.test(identifier);

  if (!isPhone && !isEmail)
    return res.status(400).json({ message: "Invalid email or phone number format" });

  const retailer = isPhone
    ? await Retailer.findOne({ phone: identifier })
    : await Retailer.findOne({ email: identifier });

  if (!retailer) return res.status(404).json({ message: "Retailer not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(identifier, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 mins

  if (isEmail) {
    await sendMail(
      retailer.email,
      "OTP for Password Reset",
      `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );
  } else {
    // Placeholder: Implement sendSMS(identifier, `Your OTP is ${otp}`);
    console.log(`Send SMS to ${identifier}: Your OTP is ${otp}`);
  }

  res.json({ message: "OTP sent successfully" });
};

// Verify OTP and return token
exports.verifyOTP = async (req, res) => {
  const { identifier, otp } = req.body;

  const entry = otpStore.get(identifier);
  if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  otpStore.delete(identifier); // Remove OTP after successful verification

  const retailer = await Retailer.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  const token = jwt.sign({ id: retailer._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  res.json({ message: "OTP verified successfully", token });
};
