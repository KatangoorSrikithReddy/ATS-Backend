const express = require("express");
const router = express.Router();
const { Individuals, Roles, LevelHierarchy, UserRoles } = require("../models"); // Import models
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const SECRET_KEY = 'ced35672f556c0ade93da500e7b579a9bf2543f6499c082463dbf1fd87768f93';
const authenticateToken = require('../middlewaare/auth');
console.log("Received Token not received for this:", authenticateToken);
/**
 * @swagger
 * /individualsRoles/create-user:
 *   post:
 *     summary: Create a new user and assign a role
 *     description: This endpoint creates a new user with unique email and username, hashes the password, and assigns a role.
 *     tags:
 *       - Individuals and Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role_id
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecureP@ssw0rd"
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 example: "d9b2d63d-a233-4123-847e-145d42a2318b"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created and role assigned successfully."
 *       400:
 *         description: Email or Username already exists
 *       500:
 *         description: Server error
 */



router.post("/create-user", authenticateToken, async (req, res) => {
    console.log("🔍 req.user:", req.user.id);
    // console.log("request.user.name", req.user.created_by)
    try {
        const { username, email, first_name, last_name, password, role_id } = req.body;
        const created_by = req.user.id; // Logged-in user's ID
        console.log("Created by", created_by)

        console.log("🔹 Incoming User Creation Request:", req.body);
        console.log("🔍 Checking if email or username already exists...");

        // 🔍 **Check if Email or Username already exists**
        const existingUser = await Individuals.findOne({
            where: { [Op.or]: [{ email }, { username }] }
        });

        if (existingUser) {
            console.log("🚨 Email or Username already exists:", existingUser);
            return res.status(400).json({ message: "Email or Username already exists." });
        }

        console.log("✅ Email and Username are unique. Proceeding...");

        // 🔍 **Fetch Role Level of Requested Role**
        console.log(`🔍 Fetching Role Level for Role ID: ${role_id}...`);

        const roleData = await Roles.findOne({
            where: { id: role_id },
            attributes: ["level_name"]
        });

        console.log("It is a Role data", roleData.level_name)

        if (!roleData) {
            console.log("🚨 Invalid Role ID. Role not found.");
            return res.status(400).json({ message: "Invalid role ID." });
        }

        const roleLevel = roleData.level_name; // Example: "Level 1"
        console.log(`✅ Role Level of Requested Role: ${roleLevel}`);

        // 🔍 **Fetch the logged-in user's role level from LevelHierarchy**
        console.log(`🔍 Fetching role level for the logged-in user: ${created_by}...`);

        // const userRole = await UserRoles.findOne({
        //     where: { user_id: created_by }, 
        //     include: [
        //         {
        //             model: Roles,
        //             attributes: ["level_name"],
        //             as: "role", // ✅ Ensure alias matches the model association
        //         }
        //     ]
        // });
        // // console.log(UserRoles.associations);
        // console.log("🔹 User Role Data:", userRole);

        const user = await Individuals.findOne({
            where: { id: created_by },  
         
            include: [
                {
                    model: Roles,
                    as: "roles", // ✅ Must match the alias in belongsToMany()
                    attributes: ["id", "role_name", "level_name"],
                    through: { attributes: [] } // ✅ Exclude `UserRoles` join table attributes
                }
            ]
        });
        
        console.log("User Roles:", user.roles);
        console.log("*********************");
        console.log("User Roles:", user.roles[0].level_name);

        console.log("*********************");

        const userRoles = await LevelHierarchy.findOne({
            where: { level: user.roles[0].level_name} // Either Logged-in user or Dummy Chidhagni
        });
        console.log("User 's Role:", userRoles);

        if (!userRoles) {
            return res.status(403).json({ message: "User level not found." });
        }

        const allowedLevels = Array.isArray(userRoles.can_create) ? userRoles.can_create : [];
        console.log("🚀 Allowed Levels:", allowedLevels);

        console.log("🛠️ Type of allowedLevels:", typeof allowedLevels);
        console.log("🚀 Allowed Levels (Lowercase):", allowedLevels.map(level => level.toLowerCase()));
        console.log("🔍 Requested Role Level (Lowercase):", roleData.level_name.toLowerCase());

        const isAllowed = allowedLevels.map(level => level.toLowerCase()).includes(roleData.level_name.toLowerCase());
        console.log("✅ Condition Result:", isAllowed);

        if (!isAllowed) {
            console.log("🚨 Permission Denied: You do not have permission to create this role level.");
            return res.status(403).json({ message: "You do not have permission to create this role level." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("✅ Password hashed successfully.");

        // ✅ **Create New User**
        console.log("🛠️ Creating new user...");
        const newUser = await Individuals.create({
            username,
            email,
            first_name,
            last_name,
            password: hashedPassword,
            created_by
        });

        console.log("✅ User Created Successfully:", newUser);

        // ✅ **Assign Role to User**
        console.log("🔗 Assigning role to user...");
        await UserRoles.create({
            user_id: newUser.id,
            role_id,
            created_by
        });

        console.log("✅ Role assigned successfully!");

        res.status(201).json({ message: "User created and role assigned successfully." });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


/**
 * @swagger
 *  /individualsRoles/login:
 *   post:
 *     summary: Login a user and generate JWT token
 *     description: Authenticate a user using email and password, returning an access token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "chidhagni@gmail.com"
 *               passwords:
 *                 type: string
 *                 example: "Chidhagni@123"
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *                 token_type:
 *                   type: string
 *                   example: "bearer"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error
 */

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      console.log("🔍 Login Attempt:", username, password);
  
      // Fetch user by email (username in request is actually the email)
      const user = await Individuals.findOne({
        where: { email: username },
        attributes: ["id", "first_name", "last_name", "password"]
      });
  
      // Debugging output to check if user exists
      console.log("👤 Retrieved User:", user);
      console.log("👤 Retrieved Password:", user.password);
  
  
      // If user not found OR hashedPassword is missing, return unauthorized
      if (!user || !user.password) {
        console.error("❌ Login Failed: User not found or password missing");
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Compare hashed password
        const isMatch = bcrypt.compareSync(password, user.password); // ✅ Correct column name
        if (!isMatch) {
            console.error("❌ Login Failed: Incorrect password", isMatch);
            return res.status(401).json({ message: "Invalid credentials" });
        }
  
      // Generate full name by concatenating firstName and lastName
      const fullName = `${user.first_name} ${user.last_name}`;
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, fullName }, // Include fullName in token
        SECRET_KEY,
        { expiresIn: "60m" }
      );
  
      console.log("✅ Login Successful for:", fullName);
  
      // Send the token back to the client
      res.status(200).json({ access_token: token, token_type: "bearer" });
    } catch (error) {
      console.error("❌ Login Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

module.exports = router;


