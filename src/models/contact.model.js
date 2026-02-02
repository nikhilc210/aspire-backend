const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    service: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    handled: { type: Boolean, default: false },
    handledAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", ContactSchema);
