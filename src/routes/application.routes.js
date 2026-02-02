const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const applicationController = require("../controllers/application.controller");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Apply for a job: accepts form fields + resume (single) + images (multiple)
router.post(
  "/:id/apply",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  applicationController.applyForJob,
);

module.exports = router;
