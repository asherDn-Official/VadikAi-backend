const Retailer = require("../models/Retailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// exports.registerRetailer = async (req, res) => {
//   const { name, email } = req.body;
//   const existing = await Retailer.findOne({ email });
//   if (existing) return res.status(400).json({ message: "Already registered" });

//   const retailer = new Retailer({ name, email });
//   await retailer.save();
//   res.json({ message: "Retailer registered. Awaiting approval." });
// };

exports.registerRetailer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      storeName,
      storeType,
      storeAddress,
      city,
      pincode,
      // photo,
      gstNumber,
      numberOfStaffs,
      shopContactNumber,
      ownerName,
      // password
    } = req.body;

    const existing = await Retailer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const profileId = Date.now();

    const fullName = `${firstName} ${lastName}`;

    let photoPath = "";
    if (req.file) {
      photoPath = req.file.path; // this is where multer saved the image
    }

    const retailer = new Retailer({
      firstName,
      lastName,
      fullName,
      phone,
      email,
      gender,
      storeName,
      storeType,
      storeAddress,
      city,
      pincode,
      photo: photoPath,  // save path image
      gstNumber,
      numberOfStaffs,
      shopContactNumber,
      ownerName,
      profileId,
      // password
    });

    await retailer.save();

    return res
      .status(201)
      .json({ message: "Retailer registered. Awaiting approval." });
  } catch (error) {
    console.error("Error registering retailer:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

exports.loginRetailer = async (req, res) => {
  try {
    const { email, password , phone} = req.body;

    // Input validation

    if (!email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const retailer = await Retailer.findOne({ email , phone });

    if (!retailer || !retailer.approved) {
      return res
        .status(403)
        .json({ message: "Retailer not approved or does not exist" });
    }

    const match = await bcrypt.compare(password, retailer.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: retailer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token expiration time
    });

    res.json({
      token,

      retailer: {
        id: retailer._id,
        name: retailer.firstName + " " + retailer.lastName,
        email: retailer.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateRetailer = async (req, res) => {
  try {
    const { retailerId } = req.params;
    const updateData = req.body;

    const retailer = await Retailer.findById(retailerId);
    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    // If a new photo is uploaded, update it
    if (req.file) {
      // Delete old photo if it exists
      if (retailer.photo) {
        const fs = require('fs');
        const path = require('path');
        const oldPhotoPath = path.join(__dirname, '..', retailer.photo);
        fs.unlink(oldPhotoPath, (err) => {
          if (err) console.warn("Failed to delete old photo:", err.message);
        });
      }

      updateData.photo = req.file.path;
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      retailer[key] = updateData[key];
    });

    await retailer.save();

    return res
      .status(200)
      .json({ message: "Retailer updated successfully", retailer });
  } catch (error) {
    console.error("Error updating retailer:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

