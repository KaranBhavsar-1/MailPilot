
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  createReplyDraft,chatWithInbox,
} = require("../controllers/ai.controller");

router.use(protect);
router.use(requireRole("assistant"));

router.post(
  "/draft/:threadId",
  asyncHandler(createReplyDraft)
);

router.post(
  "/chat",
  asyncHandler(chatWithInbox)
);

module.exports = router;
