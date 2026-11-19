
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  updateDraft,
  regenerateDraft,
  discardDraft,
  approveSimulatedSend,
} = require("../controllers/draft.controller");

router.use(protect);
router.use(requireRole("assistant"));

router.patch("/:id", asyncHandler(updateDraft));

router.post(
  "/:id/regenerate",
  asyncHandler(regenerateDraft)
);

router.post(
  "/:id/discard",
  asyncHandler(discardDraft)
);

router.post(
  "/:id/approve-send",
  asyncHandler(approveSimulatedSend)
);

module.exports = router;
