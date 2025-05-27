const express = require("express");
const router = express.Router();
const controller = require("../controllers/retailerController");
const upload = require("../middlewares/upload");

// Route: Register Retailer

// router.post("/register", controller.registerRetailer);

router.post(
  "/register",
  upload.single("photo"), // `photo` is the field name for the uploaded file
 controller.registerRetailer
);

// Route: Login Retailer

router.post("/login", controller.loginRetailer);

// Update Retailer

router.put("/update/:retailerId", upload.single("photo"), controller.updateRetailer);

// // Route: Update Basic Details

// router.put('/basic/:id', controller.updateBasicDetails);

// // Route: Update Advanced Details

// router.put('/advanced/:id', controller.updateAdvancedDetails);

// // Route: Update Privacy Details

// router.put('/privacy/:id', controller.updatePrivacyDetails);

// // Route: Update Referral Details

// router.put('/referral/:id', controller.updateReferralDetails);

module.exports = router;
