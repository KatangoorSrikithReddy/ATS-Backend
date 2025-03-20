const express = require("express");
const router = express.Router();
const { Industry } = require("../models"); // Ensure models/index.js exports Industry

// GET all industries
router.get("/", async (req, res) => {
  try {
    const industries = await Industry.findAll();
    res.status(200).json(industries);
  } catch (error) {
    console.error("Error fetching industries:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
