const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  updatePassword,
  setBlockStatus,
  login,
} = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");

// POST /api/admins - create a new admin
// GET /api/admins - list admins (protected)
// Create admin - protected: only authenticated admins can create new admins
router.post("/", auth, createAdmin);
router.post("/login", login);
router.get("/", auth, getAdmins);
// PATCH /api/admins/:id/password - update password (protected)
router.patch("/:id/password", auth, updatePassword);
// PATCH /api/admins/:id/block - block or unblock admin (protected)
router.patch("/:id/block", auth, setBlockStatus);

module.exports = router;
