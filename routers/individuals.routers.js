const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {Individuals} = require("../models");
console.log("data", Individuals)
const { authenticateToken } = require("../middlewaare/auth");

const SECRET_KEY = 'ced35672f556c0ade93da500e7b579a9bf2543f6499c082463dbf1fd87768f93';

/**
 * @swagger
 * components:
 *   schemas:
 *     Individual:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the individual
 *         username:
 *           type: string
 *           description: The username
 *         email:
 *           type: string
 *           format: email
 *           description: The individual's email
 *         password:
 *           type: string
 *           format: password
 *           description: The hashed password
 *         first_name:
 *           type: string
 *           description: The first name
 *         last_name:
 *           type: string
 *           description: The last name
 *         mobile_number:
 *           type: string
 *           description: The mobile number (optional)
 *         is_active:
 *           type: boolean
 *           description: Active status of the individual
 *           default: true
 *       example:
 *         username: johndoe
 *         email: johndoe@example.com
 *         password: password123
 *         first_name: John
 *         last_name: Doe
 *         mobile_number: "1234567890"
 *         is_active: true
 */

/**
 * @swagger
 * /individuals/register:
 *   post:
 *     summary: Register a new individual
 *     tags: [Individual]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Individual'
 *     responses:
 *       201:
 *         description: Successfully registered an individual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 individual:
 *                   $ref: '#/components/schemas/Individual'
 *       400:
 *         description: Validation error (e.g., missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username or email already exists.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post("/register", async (req, res) => {
  console.log("✅ Route Hit!");
  try {
    console.log("🔹 Incoming Request Data:", req.body);
    const { username, email, password, first_name, last_name, mobile_number } = req.body;

    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new individual
    const individual = await Individuals.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      mobile_number,
    });

    // Send success response
    res.status(201).json({ message: "User registered successfully", individual });
  } catch (error) {
    console.error("Error registering individual:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Username or email already exists." });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});


/**
 * @swagger
 * /individuals/login:
 *   post:
 *     summary: Log in an individual user
 *     tags: [Individual]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The individual's email
 *               password:
 *                 type: string
 *                 description: The individual's password
 *             example:
 *               email: johndoe@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: JWT token for authorization
 *                 token_type:
 *                   type: string
 *                   description: Type of the token
 *               example:
 *                 access_token: your_token_here
 *                 token_type: bearer
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      console.log("🔹 Incoming Login Data:", req.body);

      // ✅ Check if the email and password are provided
      if (!email || !password) {
          return res.status(400).json({ error: "Email and password are required" });
      }

      // ✅ Find user by email
      const individual = await Individuals.findOne({ where: { email } });

      if (!individual) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      // ✅ Compare hashed password
      const passwordMatch = bcrypt.compareSync(password, individual.password);
      if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      // ✅ Generate JWT token
      const token = jwt.sign(
          { id: individual.id, email: individual.email, username: individual.username },
          SECRET_KEY,
          { expiresIn: "1h" } // Token expires in 1 hour
      );

      console.log("✅ Login Successful:", individual.email);

      // ✅ Send token response
      res.json({ access_token: token, token_type: "bearer" });

  } catch (error) {
      console.error("❌ Login Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /individuals:
 *   get:
 *     summary: Get all individuals
 *     tags: [Individual]
 *     responses:
 *       200:
 *         description: Successfully retrieved all individuals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Individual'
 *       500:
 *         description: Internal Server Error
 */

router.get("/", async (req, res) => {
  try {
      console.log("🔹 Fetching all individuals...");

      const individuals = await Individuals.findAll(); // Fetch all individuals

      console.log(`✅ Retrieved ${individuals.length} individuals`);
      res.status(200).json(individuals);
  } catch (error) {
      console.error("❌ Error fetching individuals:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


/**
 * @swagger
 * /individuals/{id}:
 *   get:
 *     summary: Get an individual by ID
 *     tags: [Individual]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the individual
 *     responses:
 *       200:
 *         description: Successfully retrieved individual details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Individual'
 *       404:
 *         description: Individual not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/:id", async (req, res) => {
  try {
      const { id } = req.params;
      console.log(`🔹 Fetching individual with ID: ${id}`);

      const individual = await Individuals.findByPk(id);

      if (!individual) {
          console.warn("⚠️ Individual not found!");
          return res.status(404).json({ error: "Individual not found" });
      }

      console.log("✅ Retrieved Individual:", individual);
      res.status(200).json(individual);
  } catch (error) {
      console.error("❌ Error fetching individual:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;