const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
} = require("../controllers/contact.controller");

// POST /api/contacts - submit contact form
router.post("/", createContact);

// GET /api/contacts - admin: list contacts
router.get("/", getContacts);

module.exports = router;
