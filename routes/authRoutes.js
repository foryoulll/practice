// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// サインアップルート
router.post("/sign_up", authController.signUp);

// サインインルート
router.post("/sign_in", authController.signIn);

module.exports = router;

