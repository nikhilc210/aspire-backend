const express = require("express");
const router = express.Router();

const {
  getApplicationsByUser,
  getApplicationsByJob,
  getAllApplications,
} = require("../controllers/application.controller");

// GET /api/applications - fetch all applications (paginated)
router.get("/", getAllApplications);
// GET /api/applications/by-user?email=foo@example.com
router.get("/by-user", getApplicationsByUser);

// GET /api/applications/by-job/:id
router.get("/by-job/:id", getApplicationsByJob);

module.exports = router;
