const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getMe,
} = require("../controllers/auth.controller");

const {
  validateSignup,
  validateLogin,
} = require("../validators/auth.validators");

const { protect } = require("../middleware/auth.middleware");

const asyncHandler = require("../utils/asyncHandler");

// Public routes
router.post("/signup", validateSignup, asyncHandler(signup));
router.post("/login", validateLogin, asyncHandler(login));

// Protected route
router.get("/me", protect, asyncHandler(getMe));

module.exports = router;