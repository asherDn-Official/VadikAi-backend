const jwt = require("jsonwebtoken");

exports.verifyRetailerToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.retailer = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.verifyEmployeeToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employee = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    const Employee = require("../models/Employee");
    const employee = await Employee.findById(req.employee.id);
    if (employee && employee.permissions[permissionKey]) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  };
};
