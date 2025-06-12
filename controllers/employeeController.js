const Employee = require("../models/Employee");
const Retailer = require("../models/Retailer");
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/sendMail");

// Create Employee (Retailer only)

exports.createEmployee = async (req, res) => {
  try {
const { fullName, designation, email, phone, password, confirmPassword, permissions } = req.body;
const retailerId = req.retailer.id;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existing = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "Employee already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = new Employee({
      fullName,
      designation,
      email,
      phone,
      password: hashedPassword,
      permissions,
      retailer: retailerId
    });

    await employee.save();

    await Retailer.findByIdAndUpdate(retailerId, {
      $push: { employees: employee._id },
    });

    // Send credentials via email
    const subject = "Your Employee Account has been created";
    const html = `
      <p>Hi ${fullName},</p>
      <p>Your employee account has been created. Use the following credentials to log in:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><a href="${process.env.RETAILER_LOGIN_URL}">Login here</a></p>
    `;

    await sendMail(email, subject, html);

    res.status(201).json({ message: "Employee created and credentials sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating employee" });
  }
};

// Update Employee

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, designation, email, phone, permissions } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Update fields
    employee.fullName = fullName || employee.fullName;
    employee.designation = designation || employee.designation;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.permissions = permissions || employee.permissions;

    await employee.save();

    res.json({ message: "Employee updated successfully", employee });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Error updating employee" });
  }
};

// Delete Employee

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Soft delete
    employee.isDeleted = true;
    await employee.save();

    // Remove from retailer's employees list
    await Retailer.findByIdAndUpdate(employee.retailer, {
      $pull: { employees: employee._id },
    });

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Error deleting employee" });
  }
};

// Get Employee by ID

exports.getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate("retailer", "name phone email");
    if (!employee || employee.isDeleted) return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ message: "Error fetching employee" });
  }
};

// Get All Employees for Retailer

exports.getAllEmployees = async (req, res) => {
  try {
const retailerId = req.retailer.id;

    const employees = await Employee.find({ retailer: retailerId, isDeleted: false })
      .populate("retailer", "name phone email")
      .select("-password"); // Exclude password from response

    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

