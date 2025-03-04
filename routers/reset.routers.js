const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { Individuals } = require("../models");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const router = express.Router();

/**
 * @swagger
 * /api/request-reset:
 *   post:
 *     summary: Request password reset
 *     description: Generates a reset token and sends a password reset email.
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset link sent to your email
 *       404:
 *         description: User not found
 */
router.post("/request-reset", async (req, res) => {
    try {
      const { email } = req.body;
  
      // ✅ Find user by email
      const user = await Individuals.findOne({ where: { email } });
      console.log("user", user)
      if (!user) return res.status(404).json({ message: "User not found" });
        console.log("user", user)
      // ✅ Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour
  
      // ✅ Update user with reset token & expiry
      await user.update({ reset_token: resetToken, token_expiry: tokenExpiry });
  
      // ✅ Configure nodemailer with environment variables
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // ✅ Secure Email from .env
          pass: process.env.EMAIL_PASS, // ✅ Secure App Password from .env
        },
      });
  
      // ✅ Create reset password link
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  
      // ✅ Send email
      await transporter.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password",
        text: `Click the link to reset your password: ${resetLink}`,
      });
  
      res.json({ message: "Reset link sent to your email", resetToken: resetToken, // Adding resetToken in response
        resetLink: resetLink });
    } catch (error) {
      console.error("Error in request-reset:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Allows a user to reset their password using a valid reset token.
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abcd1234xyz"
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  console.log("new password***********************************", newPassword)

  const user = await Individuals.findOne({
    where: { reset_token: token, token_expiry: { [Op.gt]: new Date() } },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({ password: hashedPassword, reset_token: null, token_expiry: null });

  res.json({ message: "Password has been reset successfully" });
});

module.exports = router;
