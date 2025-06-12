const Retailer = require("../models/Retailer");
const Employee = require("../models/Employee"); // for login both in one endpoint
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { sendMail } = require("../utils/sendMail");
const validator = require("validator");


function formatPhone(phone, countryCode = "91") {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith(countryCode) ? digits : countryCode + digits;
}

// register Retailer

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
      numberOfCustomers,
      shopContactNumber,
      ownerName,
      // password
    } = req.body;

    const formattedPhone = formatPhone(phone);

    const existing = await Retailer.findOne({
      $or: [{ email }, { phone: formattedPhone }],
    });

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
      // phone,
        phone: formattedPhone,
      email,
      gender,
      storeName,
      storeType,
      storeAddress,
      city,
      pincode,
      photo: photoPath, // save path image
      gstNumber,
      numberOfStaffs,
      numberOfCustomers,
      shopContactNumber,
      ownerName,
      profileId,
      // password
      
    });

    await retailer.save();

  
    // Notify admin via email
    const adminEmail = process.env.EMAIL_USER;
    const subject = "New Retailer Registration - Awaiting Approval";
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2c3e50; text-align: center;">🛍️ New Retailer Registration Request</h2>
    
    <p style="font-size: 16px; color: #333;">A new retailer has registered and is awaiting your approval. Please review the details below:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tbody>
        <tr><td style="padding: 8px; font-weight: bold;">Full Name:</td><td style="padding: 8px;">${fullName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${formattedPhone}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Gender:</td><td style="padding: 8px;">${gender}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Store Name:</td><td style="padding: 8px;">${storeName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Store Type:</td><td style="padding: 8px;">${storeType}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Store Address:</td><td style="padding: 8px;">${storeAddress}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">City:</td><td style="padding: 8px;">${city}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Pincode:</td><td style="padding: 8px;">${pincode}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Number of Staffs:</td><td style="padding: 8px;">${numberOfStaffs}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Number of Customers:</td><td style="padding: 8px;">${numberOfCustomers}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Shop Contact Number:</td><td style="padding: 8px;">${shopContactNumber}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Owner Name:</td><td style="padding: 8px;">${ownerName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">GST Number:</td><td style="padding: 8px;">${gstNumber}</td></tr>
      </tbody>
    </table>

    <p style="margin-top: 20px; font-size: 16px;">✅ Please log in to the <strong>Admin Panel</strong> to review and approve this registration request.</p>

    // <div style="text-align: center; margin-top: 30px;">
    //   <a href="${process.env.vadikwebsite || '#'}" style="background-color: #2e86de; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Go to Admin Panel</a>
    // </div>

    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">This is an automated message from your system.</p>
  </div>
`;


    try {
      await sendMail(adminEmail, subject, html);
    } catch (mailErr) {
      console.error("Failed to send approval email:", mailErr);
    }

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

// common Login for Retailer and Employee


exports.loginRetailer = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email or Phone and password are required" });
    }

    const isPhone = /^\d{10}$/.test(identifier);
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);

    if (!isPhone && !isEmail) {
      return res.status(400).json({ message: "Invalid email or phone number format" });
    }

    // First check if it's a retailer
    let user;
    if (isPhone) {
      user = await Retailer.findOne({ phone: identifier });
    } else {
      user = await Retailer.findOne({ email: identifier });
    }

    if (user && user.approved) {
      const isRetailerMatch = await bcrypt.compare(password, user.password);
      if (isRetailerMatch) {
        const token = jwt.sign({ id: user._id, role: "retailer" }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return res.json({
          token,
          user: {
            id: user._id,
            name: user.firstName + " " + user.lastName,
            email: user.email,
            role: "retailer"
          },
        });
      }
    }

    // If not a retailer, try employee login
    const employee = await Employee.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (employee && !employee.isDeleted) {
      const isEmployeeMatch = await bcrypt.compare(password, employee.password);
      if (isEmployeeMatch) {
        const token = jwt.sign({ id: employee._id, role: "employee" }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return res.json({
          token,
          user: {
            id: employee._id,
            name: employee.fullName,
            email: employee.email,
            role: "employee"
          },
        });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });
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
        const fs = require("fs");
        const path = require("path");
        const oldPhotoPath = path.join(__dirname, "..", retailer.photo);
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
