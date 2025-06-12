const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

const {
  verifyRetailerToken,
  verifyEmployeeToken,
  checkPermission
} = require("../middlewares/auth");

//  Create Employee (Retailer only)
router.post("/create", verifyRetailerToken, employeeController.createEmployee);

// Protected employee route: Admin Dashboard Access
router.get(
  "/dashboard",
  verifyEmployeeToken,
  checkPermission("adminDashboard"),
  (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard!" });
  }
); // and add more permissions as needed

//  Get All Employees (Retailer)
router.get("/all", verifyRetailerToken, employeeController.getAllEmployees);

//  Get Employee by ID (Retailer)
router.get("/:id", verifyRetailerToken, employeeController.getEmployee);

//  Update Employee (Retailer)
router.put("/update/:id", verifyRetailerToken, employeeController.updateEmployee);

//  Delete Employee (Retailer - Soft Delete)
router.delete("/delete/:id", verifyRetailerToken, employeeController.deleteEmployee);

module.exports = router;
