const express = require("express");
const router = express.Router();
const controller = require("../controllers/passwordController.js");

router.put("/change-password", controller.changePassword);

router.post("/send-reset-link", controller.sendResetLink);
router.post("/reset-password/:token", controller.resetPassword);

module.exports = router;