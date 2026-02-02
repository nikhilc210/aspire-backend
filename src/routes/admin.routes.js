const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  updatePassword,
  setBlockStatus,
} = require("../controllers/admin.controller");

// POST /api/admins - create a new admin
// GET /api/admins - list admins
router.get("/", getAdmins);
// PATCH /api/admins/:id/password - update password
router.patch("/:id/password", updatePassword);
// PATCH /api/admins/:id/block - block or unblock admin
router.patch("/:id/block", setBlockStatus);
router.post("/", createAdmin);

module.exports = router;
