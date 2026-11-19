const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Return safe user details (never return password)
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  assistantId: user.assistantId || null,
});

// Generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/signup
const signup = async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Unable to create account with these details",
    });
  }

//   const hashedPassword = await bcrypt.hash(password, 12);

//   const user = await User.create({
//     name,
//     email,
//     password: hashedPassword,
//     role: "assistant",
//     assistantId: null,
//   });

const hashedPassword = await bcrypt.hash(password, 12);

const user = await User.create({
  name,
  email,
  passwordHash: hashedPassword,
  role: "assistant",
  assistantId: null,
});

  const token = generateToken(user);

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: safeUser(user),
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

//   const user = await User.findOne({ email }).select("+password");

//   if (!user || !(await bcrypt.compare(password, user.password))) {
const user = await User.findOne({ email }).select("+passwordHash");

if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken(user);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: safeUser(user),
  });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: safeUser(req.user),
  });
};

module.exports = {
  signup,
  login,
  getMe,
};