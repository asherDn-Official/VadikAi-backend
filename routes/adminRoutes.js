const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");

router.post("/register", controller.registerAdmin);
router.post("/login", controller.loginAdmin);

router.get("/retailers", controller.getRetailers);
router.post("/approve/:retailerId", controller.approveRetailer);
router.delete("/delete-retailer/:retailerId", controller.deleteRetailer);

router.put("/update-role/:adminId", controller.updateAdminRole);

router.post("/reset-password/:retailerId", controller.adminResetPassword);

module.exports = router;
