const path = require("path");
const Application = require("../models/application.model");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id || null;
    const { fullname, email, company, phone, service, message } =
      req.body || {};

    if (!fullname || !email) {
      return res
        .status(400)
        .json({ success: false, message: "fullname and email are required" });
    }

    const files = req.files || {};

    // resume: single file
    let resumeUrl = null;
    if (files.resume && files.resume.length > 0) {
      const r = files.resume[0];
      resumeUrl = `/uploads/${r.filename}`;
    }

    // images: array
    const images = (files.images || []).map((f) => ({
      filename: f.filename,
      url: `/uploads/${f.filename}`,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const application = new Application({
      job: jobId,
      fullname,
      email,
      company,
      phone,
      service,
      message,
      resumeUrl,
      images,
    });

    await application.save();

    return res
      .status(201)
      .json({ success: true, message: "Application submitted", application });
  } catch (err) {
    console.error("applyForJob error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
