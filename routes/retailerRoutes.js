const express = require("express");
const router = express.Router();
// const controller = require("../controllers/retailerController");
const retailerController = require("../controllers/retailerController");
const otpController = require("../controllers/otpController");
const upload = require("../middlewares/upload");

// Route: Register Retailer

router.post(
  "/register",
  upload.single("photo"), // `photo` is the field name for the uploaded file
 retailerController.registerRetailer
);

// Route: Login Retailer

router.post("/login", retailerController.loginRetailer);

// Update Retailer

router.put("/update/:retailerId", upload.single("photo"), retailerController.updateRetailer);

// OTP-based password reset

router.post("/send-otp", otpController.sendOTP);
router.post("/verify-otp", otpController.verifyOTP);

// router.post("/reset-password/:token", retailerController.resetPassword);  - use password controller instead of retailerController

module.exports = router;
