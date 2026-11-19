const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  getClientThreads,
  getClientThreadById,
  handleClientThread,
  handoffClientThread,
} = require("../controllers/client.controller");

// All client routes require an authenticated client.
router.use(protect);
router.use(requireRole("client"));

// List conversations requiring client attention.
router.get("/threads", asyncHandler(getClientThreads));

// Client conversation detail.
router.get("/threads/:id", asyncHandler(getClientThreadById));

// Client actions.
router.patch(
  "/threads/:id/handled",
  asyncHandler(handleClientThread)
);

router.patch(
  "/threads/:id/handoff",
  asyncHandler(handoffClientThread)
);

module.exports = router;