const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  updateJob,
  getAllJobs,
  setJobBlockStatus,
} = require("../controllers/job.controller");

// POST /api/jobs - create a job
router.post("/", createJob);

// GET /api/jobs - list jobs (supports ?page=&limit=&postedBy=)
router.get("/", getJobs);

// GET /api/jobs/all - fetch all jobs (no pagination)
router.get("/all", getAllJobs);

// PATCH /api/jobs/:id - update a job
// PATCH /api/jobs/:id/block - block or unblock a job
router.patch("/:id/block", setJobBlockStatus);

// PATCH /api/jobs/:id - update a job
router.patch("/:id", updateJob);

module.exports = router;
