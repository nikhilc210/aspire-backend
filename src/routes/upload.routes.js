const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const uploadController = require("../controllers/upload.controller");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Upload files (field name: files)
router.post("/", upload.array("files"), uploadController.uploadFile);

// List files
router.get("/", uploadController.listFiles);

// Download a file
router.get("/:filename", uploadController.getFile);

module.exports = router;
