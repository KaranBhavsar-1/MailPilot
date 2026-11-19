
const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");


const {
  getThreads,
  getThreadById,
  updateThread,
  updateThreadClassification,
  resetThreadClassification,
  analyzeThread,
  getThreadStats,
  simulateIncomingEmail,
  getUpcomingDates,
} = require("../controllers/thread.controller");


// All thread routes require an authenticated assistant.
router.use(protect);
router.use(requireRole("assistant"));

// IMPORTANT: Register /stats before /:id.
router.get("/stats", asyncHandler(getThreadStats));

// Get upcoming dates extracted from the latest AI analyses.
router.get(
  "/upcoming-dates",
  asyncHandler(getUpcomingDates)
);

// Run AI classification on a complete conversation.
router.post(
  "/:id/analyze",
  asyncHandler(analyzeThread)
);

router.get("/", asyncHandler(getThreads));

// Simulate a new incoming email.
router.post(
  "/simulate-incoming",
  asyncHandler(simulateIncomingEmail)
);

router.get("/:id", asyncHandler(getThreadById));

router.patch("/:id", asyncHandler(updateThread));

// Manual classification correction.
router.patch(
  "/:id/classification",
  asyncHandler(updateThreadClassification)
);

// Reset manual correction to the latest AI recommendation.
router.patch(
  "/:id/classification/reset",
  asyncHandler(resetThreadClassification)
);



module.exports = router;
