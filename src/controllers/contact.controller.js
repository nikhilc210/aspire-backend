const Contact = require("../models/contact.model");

// Submit contact form
exports.createContact = async (req, res) => {
  try {
    const { fullname, email, company, phone, service, message } = req.body;

    if (!fullname || !email || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "fullname, email and message are required",
        });
    }

    const contact = new Contact({
      fullname,
      email,
      company,
      phone,
      service,
      message,
    });
    await contact.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Contact submitted",
        contact: {
          id: contact._id,
          fullname: contact.fullname,
          email: contact.email,
          createdAt: contact.createdAt,
        },
      });
  } catch (err) {
    console.error("createContact error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// (Optional) Admin: list contact submissions
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
    return res
      .status(200)
      .json({ success: true, message: "Contacts fetched", contacts });
  } catch (err) {
    console.error("getContacts error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
