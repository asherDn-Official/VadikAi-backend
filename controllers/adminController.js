const Admin = require("../models/Admin");
const Retailer = require("../models/Retailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendCredentials } = require("../utils/mailer");
const { sendMail } = require("../utils/sendMail");

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, phone, role } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "Email or Phone number and password are required." });
    }

    // const existingAdmin = await Admin.findOne({ $or: [{ email }, { phone }],
    // });
     const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    const existingAdmin = await Admin.findOne({ $or: query });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin with this email or phone already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ email, phone, password: hashedPassword, role });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully." });

  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ message: "An error occurred while registering admin." });
  }
};


exports.loginAdmin = async (req, res) => {
  try {
    // const { email, password } = req.body;
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({  $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } 
    );

    res.status(200).json({ token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong during login." });
  }
};


// exports.getRetailers = async (req, res) => {
//   const retailers = await Retailer.find();
//   res.json(retailers);
// };

exports.getRetailers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.profileId) filters.profileId = req.query.profileId;
    if (req.query.firstName) {
      filters.firstName = { $regex: req.query.firstName, $options: "i" }; // case-insensitive
    }
    if (req.query.phone) filters.phone = req.query.phone;
    if (req.query.gender) filters.gender = req.query.gender;
    if (req.query.source) filters.source = req.query.source;
    if (req.query.profession) filters.profession = req.query.profession;
    if (req.query.location) filters.location = req.query.location;
    if (req.query.incomeLevel) filters.incomeLevel = req.query.incomeLevel;

    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const direction = req.query.sortOrder === "desc" ? -1 : 1;
      sort[req.query.sortBy] = direction;
    }

    const retailers = await Retailer.find(filters).sort(sort);
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveRetailer = async (req, res,) => {
  try {
    const { retailerId } = req.params;

    if (!retailerId) {
      return res.status(400).json({ message: "Retailer ID is required." });
    }

    const retailer = await Retailer.findById(retailerId);
    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found." });
    }

    const tempPassword = Math.random().toString(36).slice(-8);

    retailer.password = await bcrypt.hash(tempPassword, 10);
    retailer.approved = true;

    await retailer.save();

    const fullName = `${retailer.firstName} ${retailer.lastName}`;

    await sendCredentials(retailer.email, tempPassword, fullName);

    res.status(200).json({ message: "Retailer approved and credentials sent." });
  } catch (error) {
    console.error("Error approving retailer:", error);
    res.status(500).json({ message: "Failed to approve retailer. Please try again." });
  }
};


exports.deleteRetailer = async (req, res) => {
  try {
    const { retailerId } = req.params;
    if (!retailerId) {
      return res.status(400).json({ message: "Retailer ID is required." });
    }

    const deletedRetailer = await Retailer.findByIdAndUpdate(
      retailerId,
      {
        isDeleted: true,
        deletedAt: new Date()     // Soft delete Method
      },
      { new: true }
    );

    if (!deletedRetailer) {
      return res.status(404).json({ message: "Retailer not found." });
    }

    res.status(200).json({ message: "Retailer soft-deleted successfully.", retailer: deletedRetailer });
  } catch (error) {
    console.error("Error soft-deleting retailer:", error);
    res.status(500).json({ message: "Failed to delete retailer. Please try again." });
  }
};



// just for superadmin role / try middleware

exports.updateAdminRole = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requestingAdmin = await Admin.findById(decoded.id);

    if (requestingAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Superadmin only." });
    }

    const { adminId } = req.params;
    const { newRole } = req.body;

    if (!["admin", "superadmin"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const targetAdmin = await Admin.findById(adminId);
    if (!targetAdmin)
      return res.status(404).json({ message: "Admin not found" });

    targetAdmin.role = newRole;
    await targetAdmin.save();

    res.json({ message: `Admin role updated to ${newRole}` });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// admin reset retailer password and email it!

exports.adminResetPassword = async (req, res) => {
  try {
    const { retailerId } = req.params;

    if (!retailerId) {
      return res.status(400).json({ message: "Retailer ID is required." });
    }

    const retailer = await Retailer.findById(retailerId);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found." });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    retailer.password = await bcrypt.hash(tempPassword, 10);
    await retailer.save();

    const fullName = `${retailer.firstName} ${retailer.lastName}` || retailer.email;

    await sendMail(
      retailer.email,
      "Your New Temporary Password",
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hello ${fullName},</h2>
          <p>Your new temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please log in and change it immediately.</p>
          <br/>
          <p>Best regards,<br/>Vadik.Ai Team</p>
        </div>
      `
    );

    res.status(200).json({ message: "Retailer password reset and emailed successfully." });
  } catch (error) {
    console.error("Admin password reset failed:", error);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};

