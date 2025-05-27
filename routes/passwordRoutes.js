const express = require("express");
const router = express.Router();
const controller = require("../controllers/passwordController.js");

router.put("/change-password", controller.changePassword);

router.post("/send-reset-link", controller.sendResetLink);
router.put("/reset-password/:token", controller.resetPassword);

module.exports = router;