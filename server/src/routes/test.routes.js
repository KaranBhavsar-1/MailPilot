const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/assistant",
  protect,
  requireRole("assistant"),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Assistant access granted",
    });
  })
);

router.get(
  "/client",
  protect,
  requireRole("client"),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Client access granted",
    });
  })
);

module.exports = router;