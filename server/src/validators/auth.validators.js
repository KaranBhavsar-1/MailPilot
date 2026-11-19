const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  if (typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid input types",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters",
    });
  }

  // Public signup is restricted to assistant accounts.
  if (role && role !== "assistant") {
    return res.status(403).json({
      success: false,
      message: "Client accounts must be created through an authorised invite or demo seed",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
};