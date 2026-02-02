const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: false },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String },
    phone: { type: String },
    service: { type: String },
    message: { type: String },
    resumeUrl: { type: String },
    images: [
      {
        filename: String,
        url: String,
        mimeType: String,
        size: Number,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Application", ApplicationSchema);
