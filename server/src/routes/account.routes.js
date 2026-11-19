
// const express = require("express");
// const router = express.Router();

// const protect = require("../middleware/auth.middleware");
// const { requireRole } = require("../middleware/role.middleware");
// const asyncHandler = require("../utils/asyncHandler");

// const {
//   getAccounts,
//   connectAccount,
//   syncAccount,
//   disconnectAccount,
// } = require("../controllers/account.controller");

// router.use(protect, requireRole("assistant"));

// router.get("/", asyncHandler(getAccounts));
// router.post("/connect", asyncHandler(connectAccount));
// router.post("/:id/sync", asyncHandler(syncAccount));
// router.patch("/:id/disconnect", asyncHandler(disconnectAccount));

// module.exports = router;



const express = require("express");
const router = express.Router();

// const protect = require("../middleware/auth.middleware");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

const {
  getAccounts,
  connectAccount,
  syncAccount,
  disconnectAccount,
} = require("../controllers/account.controller");

// Protect all account routes.
router.use(protect);
router.use(requireRole("assistant"));

router.get("/", asyncHandler(getAccounts));
router.post("/connect", asyncHandler(connectAccount));
router.post("/:id/sync", asyncHandler(syncAccount));
router.patch("/:id/disconnect", asyncHandler(disconnectAccount));

module.exports = router;
