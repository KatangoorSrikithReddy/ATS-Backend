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

// router.post("/login", async (req, res) => {
//     const { username, password } = req.body;
  
//     try {
//       console.log("🔍 Login Attempt:", username, password);
  
//       // Fetch user by email (username in request is actually the email)
//       const user = await Individuals.findOne({
//         where: { email: username },
//         attributes: ["id", "first_name", "last_name", "password"]
//       });
  
//       // Debugging output to check if user exists
//       console.log("👤 Retrieved User:", user);
//       console.log("👤 Retrieved Password:", user.password);
  
  
//       // If user not found OR hashedPassword is missing, return unauthorized
//       if (!user || !user.password) {
//         console.error("❌ Login Failed: User not found or password missing");
//         return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // ✅ Compare hashed password
//         const isMatch = bcrypt.compareSync(password, user.password); // ✅ Correct column name
//         if (!isMatch) {
//             console.error("❌ Login Failed: Incorrect password", isMatch);
//             return res.status(401).json({ message: "Invalid credentials" });
//         }
  
//       // Generate full name by concatenating firstName and lastName
//       const fullName = `${user.first_name} ${user.last_name}`;
  
//       // Generate JWT token
//       const token = jwt.sign(
//         { id: user.id, fullName }, // Include fullName in token
//         SECRET_KEY,
//         { expiresIn: "60m" }
//       );
  
//       console.log("✅ Login Successful for:", fullName);
  
//       // Send the token back to the client
//       res.status(200).json({ access_token: token, token_type: "bearer" });
//     } catch (error) {
//       console.error("❌ Login Error:", error);
//       res.status(500).json({ error: "Something went wrong" });
//     }
//   });



// router.post("/login", async (req, res) => {
//     const { username, password } = req.body;
  
//     try {
//         console.log("🔍 Login Attempt:", username, password);
  
//         // 🔑 Fetch user by email
//         const user = await Individuals.findOne({
//             where: { email: username },
//             attributes: ["id", "first_name", "last_name", "password"]
//         });
  
//         if (!user || !user.password) {
//             console.error("❌ Login Failed: User not found or password missing");
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // 🔑 Compare hashed password
//         const isMatch = bcrypt.compareSync(password, user.password);
//         if (!isMatch) {
//             console.error("❌ Login Failed: Incorrect password");
//             return res.status(401).json({ message: "Invalid credentials" });
//         }
  
//         // 🔍 Fetch roles and permissions from UserRoles
//         const userRoles = await UserRoles.findAll({
//             where: { user_id: user.id },
//             include: [
//                 {
//                     model: Roles,
//                     as: "role",  // Ensure alias matches your Sequelize association
//                     attributes: ["id", "role_name", "level_name", "permissions"]
//                 }
//             ]
//         });

//         console.log("🎯 Retrieved User Roles:", userRoles);

//         // 📝 Format roles and permissions
//         const roles = userRoles.map(userRole => ({
//             // role_id: userRole.role.id,
//             // role_name: userRole.role.role_name,
//             level_name: userRole.role.level_name,
//             permissions: userRole.role.permissions || []
//         }));

//         // 🔑 Generate JWT token
//         const token = jwt.sign(
//             { id: user.id, roles },
//             SECRET_KEY,
//             { expiresIn: "60m" }
//         );

//         console.log("✅ Login Successful for:", user.first_name);

//         // 📤 Send response with user and roles
//         res.status(200).json({
//             access_token: token,
//             token_type: "bearer",
//             user: {
//                 id: user.id,
//                 full_name: `${user.first_name} ${user.last_name}`,

//                 roles: roles
//             }
//         });

//     } catch (error) {
//         console.error("❌ Login Error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


// router.post("/login", async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         console.log("🔍 Login Attempt:", username);

//         // 🔍 Step 1: Fetch User and Their Role using correct alias
//         const userRole = await UserRoles.findOne({
//             include: [
//                 {
//                     model: Individuals,
//                     as: "user", // Use correct alias
//                     attributes: ["id", "first_name", "last_name", "password"],
//                     where: { email: username }, // Find user by email
//                 },
//                 {
//                     model: Roles,
//                     as: "role", // Ensure alias matches Sequelize association
//                     attributes: ["id", "role_name", "level_name", "permissions"]
//                 }
//             ]
//         });

//         console.log("this credentials ", userRole)

//         // ✅ Step 2: Check if User Exists & Role is Assigned
//         if (!userRole || !userRole.individual) {
//             console.error("❌ Login Failed: User not found or has no role assigned");
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // 🆔 Extract User Details
//         const user = userRole.individual; // Using alias 'individual'

//         // 🔑 Step 3: Validate Password
//         if (!user.password || !bcrypt.compareSync(password, user.password)) {
//             console.error("❌ Login Failed: Incorrect password");
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // 📝 Step 4: Get Single Role Object (Not an array)
//         const role = {
//             role_id: userRole.role.id,
//             role_name: userRole.role.role_name,
//             level_name: userRole.role.level_name,
//             permissions: userRole.role.permissions || []
//         };

//         console.log("🎯 Retrieved User Role:", role);

//         // 🔐 Step 5: Generate JWT Token
//         const token = jwt.sign(
//             { id: user.id, role }, // Store single role (not array)
//             SECRET_KEY,
//             { expiresIn: "60m" }
//         );

//         console.log("✅ Login Successful for:", user.first_name);

//         // 📤 Step 6: Send Response (Single Role, Not an Array)
//         res.status(200).json({
//             access_token: token,
//             token_type: "bearer",
//             user: {
//                 id: user.id,
//                 full_name: `${user.first_name} ${user.last_name}`,
//                 role: role  // Return a single role, not an array
//             }
//         });

//     } catch (error) {
//         console.error("❌ Login Error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Login Attempt:", username);

        // 🔍 Step 1: Fetch User from Individuals Table
        const user = await Individuals.findOne({
            where: { email: username },
            attributes: ["id", "first_name", "last_name", "password"]
        });

        if (!user) {
            console.error("❌ Login Failed: User not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ User Found:", user);

        // 🔑 Step 2: Validate Password
        if (!user.password || !bcrypt.compareSync(password, user.password)) {
            console.error("❌ Login Failed: Incorrect password");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 🔍 Step 3: Fetch Role ID from UserRoles Table
        const userRole = await UserRoles.findOne({
            where: { user_id: user.id },
            attributes: ["role_id"]
        });

        if (!userRole) {
            console.error("❌ Login Failed: No role assigned to user");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ Role ID Found:", userRole.role_id);

        // 🔍 Step 4: Fetch Role Details from Roles Table
        const role = await Roles.findOne({
            where: { id: userRole.role_id },
            attributes: ["id", "role_name", "level_name", "permissions"]
        });

        if (!role) {
            console.error("❌ Login Failed: Role not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ Role Retrieved:", role);

        // 🔐 Step 5: Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role }, // Store single role (not array)
            SECRET_KEY,
            { expiresIn: "60m" }
        );

        console.log("✅ Login Successful for:", user.first_name);

        // 📤 Step 6: Send Response (Single Role, Not an Array)
        res.status(200).json({
            access_token: token,
            token_type: "bearer",
            user: {
                id: user.id,
                full_name: `${user.first_name} ${user.last_name}`,
                role: role  // ✅ Return a single role, not an array
            }
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


/**
 * @swagger
 * /individualsRoles/api/account/me:
 *   get:
 *     summary: Get authenticated user details with roles
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: object
 *                       properties:
 *                         role_name:
 *                           type: string
 *                         level_name:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: User or role not found
 */
router.get("/api/account/me", authenticateToken, async (req, res) => {
    try {
        console.log("🔍 Fetching UserRole for:", req.user.id);

        // Step 1: Get user_id from UserRoles table
        const userRole = await UserRoles.findOne({
            where: { user_id: req.user.id  }, // Use ID from decoded JWT
            // attributes: ["user_id", "role_id"]
        });

        console.log("✅ Found UserRole:", userRole);
        console.log("🔍 Extracted user_id from UserRole:", userRole.user_id);
        console.log("🔍 Extracted role_id from UserRole:", userRole.role_id);


        if (!userRole) {
            return res.status(404).json({ message: "User role not found" });
        }

        console.log("✅ Found UserRole:", userRole);

        // Step 2: Fetch user details from Individuals table
        const user = await Individuals.findOne({
            where: { id: userRole.user_id },
            attributes: ["id", "first_name", "last_name", "email"]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Found User:", user);

        // Step 3: Fetch role details from Roles table
        const role = await Roles.findOne({
            where: { id: userRole.role_id },
            attributes: ["id", "role_name", "level_name", "permissions"]
        });

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        console.log("✅ Found Role:", role);

        // Step 4: Return the final user object with role details
        res.status(200).json({
            user: {
                id: user.id,
                full_name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: {
                    role_name: role.role_name,
                    level_name: role.level_name,
                    permissions: role.permissions || []
                }
            }
        });

    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});






/**
 * @swagger
 * /individualsRoles/get-users-with-roles:
 *   get:
 *     summary: Get all users with their assigned roles
 *     description: Retrieves a list of all users along with their assigned roles from the UserRoles table.
 *     tags:
 *       - Individuals and Roles
 *     responses:
 *       200:
 *         description: List of users with their assigned roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   username:
 *                     type: string
 *                     example: "john_doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role_id:
 *                           type: string
 *                           format: uuid
 *                           example: "6e8cc34a-e9f4-11ef-bc93-6c24086040f8"
 *                         role_name:
 *                           type: string
 *                           example: "Admin"
 *                         level:
 *                           type: string
 *                           example: "Level 1"
 *       500:
 *         description: Server error.
 */

// router.get("/get-users-with-roles", async (req, res) => {
//     console.log("🔥 Fetching Users with Roles");

//     try {
//         const userRoles = await UserRoles.findAll({
//             include: [
//                 {
//                     model: Individuals,
//                     as: 'user',  // This is the alias used in the association
//                     attributes: ['id', 'username', 'email', 'first_name', 'last_name'],  // Add the fields you need
//                 },
//                 {
//                     model: Roles,
//                     as: 'role',  // This is the alias used in the association
//                     attributes: ['id', 'role_name'],  // Add the fields you need
//                 }
//             ]
//         });

//         // Send the user roles as the response
//         res.json(userRoles);
//     } catch (error) {
//         console.error('Error fetching user roles:', error);
//         res.status(500).json({ error: 'Failed to fetch user roles' });
//     }
// });

router.get("/get-users-with-roles", authenticateToken, async (req, res) => {
    try {
        const loggedInUserId = req.user.id;// The ID of the logged-in user

        // Fetch the role details of the logged-in user
        const userRole = await UserRoles.findOne({
            where: { user_id: loggedInUserId },
            include: [
                {
                    model: Roles,
                    as: "role",
                    attributes: ["id", "role_name", "level_name", "parent_role_id"]
                }
            ]
        });

        if (!userRole || !userRole.role) {
            return res.status(403).json({ error: "User role not found!" });
        }

        const userRoleId = userRole.role.id;
        const userLevel = userRole.role.level_name;
        let usersQuery = {};

        console.log(`🔍 Fetching users for role: ${userRole.role.role_name} (Level: ${userLevel})`);

        // **Step 1: Find all roles that are under the current user's role**
        const getSubRoles = async (roleId) => {
            const subRoles = await Roles.findAll({
                where: { parent_role_id: roleId },
                attributes: ["id"]
            });
            return subRoles.map(role => role.id);
        };

        // **Step 2: Dynamically determine access rules**
        if (userLevel === "Level 0") { 
            // **Top-most level can see everything**
            console.log("🔓 Level 0 detected (Full access)");
            usersQuery = {
                user_id: { [Op.ne]: loggedInUserId }, // Exclude the logged-in Level 0 user
                role_id: {
                    [Op.notIn]: await Roles.findAll({
                        where: { level_name: "Level 0" },
                        attributes: ["id"]
                    }).then(roles => roles.map(role => role.id)) // Exclude all Level 0 users
                }
            };
            
        } else {
            // **Fetch all child roles under the current role**
            const subRoleIds = await getSubRoles(userRoleId);

            usersQuery = {
                [Op.or]: [
                    { created_by: loggedInUserId }, // Users created by this user
                    { role_id: { [Op.in]: subRoleIds } } // Users in roles under them
                ]
            };
        }

        // **Step 3: Fetch Users with the filtered query**
        const usersWithRoles = await UserRoles.findAll({
            where: usersQuery,
            include: [
                {
                    model: Individuals,
                    as: "user",
                    attributes: ["id", "username", "email", "first_name", "last_name"]
                },
                {
                    model: Roles,
                    as: "role",
                    attributes: ["id", "role_name", "level_name", "parent_role_id", "permissions"],
                    include: [
                        {
                            model: Roles,
                            as: "ParentRole",  // ✅ Fetch Parent Role (Self-reference)
                            attributes: ["id", "role_name"]  // ✅ Only fetch required fields
                        }
                    ]
                }
            ]
        });

        console.log(`✅ Found ${usersWithRoles.length} users`);
        res.json(usersWithRoles);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});



/**
 * @swagger
 * /individualsRoles/update-user/{id}:
 *   put:
 *     summary: Update user details except password and email
 *     description: This endpoint updates a user's details while preventing changes to email and password.
 *     tags:
 *       - Individuals and Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - first_name
 *               - last_name
 *               - role_id
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe_updated"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               role_id:
 *                 type: string
 *                 format: uuid
 *                 example: "d9b2d63d-a233-4123-847e-145d42a2318b"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully."
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// router.put("/update-user/:id", authenticateToken, async (req, res) => {
//     try {
//         const { id } = req.params; // This is the UserRoles ID
//         const { username, first_name, last_name, role_id } = req.body;
//         const updated_by = req.user.id; // Logged-in user's ID

//         console.log(`🔹 Incoming User Update Request for UserRoles ID: ${id}`, req.body);
        
//         // 🔍 **Step 1: Check if UserRoles Exists**
//         const userRole = await UserRoles.findOne({
//             where: { id },
//             include: [
//                 {
//                     model: Individuals,
//                     as: "user",
//                     attributes: ["id", "username", "email", "first_name", "last_name"]
//                 },
//                 {
//                     model: Roles,
//                     as: "role",
//                     attributes: ["id", "role_name", "level_name", "parent_role_id"]
//                 }
//             ]
//         });

//         if (!userRole) {
//             console.log("🚨 UserRoles entry not found.");
//             return res.status(404).json({ message: "User role record not found." });
//         }

//         const user_id = userRole.user?.id; // Get user_id from Individuals
//         console.log("✅ Extracted User ID:", user_id);

//         if (!user_id) {
//             console.log("🚨 User ID not found in Individuals.");
//             return res.status(404).json({ message: "User record not found." });
//         }

//         console.log("✅ User exists. Proceeding with role validation...");

//         // 🔍 **Step 2: Validate Role**
//         const roleData = await Roles.findOne({
//             where: { id: role_id },
//             attributes: ["level_name"]
//         });

//         if (!roleData) {
//             console.log("🚨 Invalid Role ID. Role not found.");
//             return res.status(400).json({ message: "Invalid role ID." });
//         }

//         console.log(`✅ Role Level of Requested Role: ${roleData.level_name}`);

//         // 🔍 **Step 3: Fetch the logged-in user's role level from `UserRoles`**
//         const loggedInUserRole = await UserRoles.findOne({
//             where: { user_id: updated_by },
//             include: [
//                 {
//                     model: Roles,
//                     as: "role",
//                     attributes: ["id", "role_name", "level_name"]
//                 }
//             ]
//         });

//         if (!loggedInUserRole) {
//             console.log("🚨 Logged-in user's role not found.");
//             return res.status(403).json({ message: "Logged-in user's role not found." });
//         }

//         console.log("Logged-in User Role:", loggedInUserRole.role.level_name);

//         const userRoles = await LevelHierarchy.findOne({
//             where: { level: loggedInUserRole.role.level_name }
//         });

//         if (!userRoles) {
//             return res.status(403).json({ message: "User level not found." });
//         }

//         const allowedLevels = Array.isArray(userRoles.can_create) ? userRoles.can_create : [];
//         console.log("🚀 Allowed Levels:", allowedLevels.map(level => level.toLowerCase()));

//         const isAllowed = allowedLevels.map(level => level.toLowerCase()).includes(roleData.level_name.toLowerCase());
//         console.log("✅ Permission Check:", isAllowed);

//         if (!isAllowed) {
//             console.log("🚨 Permission Denied: You cannot update this role level.");
//             return res.status(403).json({ message: "You do not have permission to update this role level." });
//         }

//         // 🔍 **Step 4: Update User Details in `Individuals`**
//         console.log("🛠️ Updating user details...");
//         const [updatedCount] = await Individuals.update(
//             { username, first_name, last_name },
//             { where: { id: user_id } }
//         );

//         if (updatedCount === 0) {
//             console.log("⚠️ No changes made. Data might be identical.");
//             return res.status(400).json({ message: "No changes made." });
//         }

//         console.log("✅ User details updated successfully.");

//         // 🔗 **Step 5: Update User Role in `UserRoles`**
//         console.log("🔗 Updating user role...");
//         await UserRoles.update(
//             { role_id, updated_by },
//             { where: { id } }
//         );

//         console.log("✅ Role updated successfully!");

//         // 🔍 **Step 6: Fetch and return updated user details**
//         const updatedUser = await Individuals.findOne({ where: { id: user_id } });

//         res.status(200).json({ message: "User updated successfully.", updatedUser });
//     } catch (error) {
//         console.error("❌ Error updating user:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// router.put("/update-user/:id", authenticateToken, async (req, res) => {
//     try {
//         const { id } = req.params; // This is the UserRoles ID
//         const { username, first_name, last_name, role_id , permissions} = req.body;
//         const updated_by = req.user.id; // Logged-in user's ID

//         console.log(`🔹 Incoming User Update Request for UserRoles ID: ${id}`, req.body);
        
//         // 🔍 **Step 1: Check if UserRoles Exists**
//         const userRole = await UserRoles.findOne({
//             where: { id },
//             include: [
//                 {
//                     model: Individuals,
//                     as: "user",
//                     attributes: ["id", "username", "email", "first_name", "last_name"]
//                 },
//                 {
//                     model: Roles,
//                     as: "role",
//                     attributes: ["id", "role_name", "level_name", "parent_role_id"]
//                 }
//             ]
//         });

//         if (!userRole) {
//             console.log("🚨 UserRoles entry not found.");
//             return res.status(404).json({ message: "User role record not found." });
//         }

//         const user_id = userRole.user?.id; // Get user_id from Individuals
//         console.log("✅ Extracted User ID:", user_id);

//         if (!user_id) {
//             console.log("🚨 User ID not found in Individuals.");
//             return res.status(404).json({ message: "User record not found." });
//         }

//         console.log("✅ User exists. Proceeding with role validation...");

//         // 🔍 **Step 2: Validate Role**
//         const roleData = await Roles.findOne({
//             where: { id: role_id },
//             attributes: ["level_name"]
//         });

//         if (!roleData) {
//             console.log("🚨 Invalid Role ID. Role not found.");
//             return res.status(400).json({ message: "Invalid role ID." });
//         }

//         console.log(`✅ Role Level of Requested Role: ${roleData.level_name}`);

//         // 🔍 **Step 3: Fetch the logged-in user's role level from `UserRoles`**
//         const loggedInUserRole = await UserRoles.findOne({
//             where: { user_id: updated_by },
//             include: [
//                 {
//                     model: Roles,
//                     as: "role",
//                     attributes: ["id", "role_name", "level_name"]
//                 }
//             ]
//         });

//         if (!loggedInUserRole) {
//             console.log("🚨 Logged-in user's role not found.");
//             return res.status(403).json({ message: "Logged-in user's role not found." });
//         }

//         console.log("Logged-in User Role:", loggedInUserRole.role.level_name);

//         const userRoles = await LevelHierarchy.findOne({
//             where: { level: loggedInUserRole.role.level_name }
//         });

//         if (!userRoles) {
//             return res.status(403).json({ message: "User level not found." });
//         }

//         const allowedLevels = Array.isArray(userRoles.can_create) ? userRoles.can_create : [];
//         console.log("🚀 Allowed Levels:", allowedLevels.map(level => level.toLowerCase()));

//         const isAllowed = allowedLevels.map(level => level.toLowerCase()).includes(roleData.level_name.toLowerCase());
//         console.log("✅ Permission Check:", isAllowed);

//         if (!isAllowed) {
//             console.log("🚨 Permission Denied: You cannot update this role level.");
//             return res.status(403).json({ message: "You do not have permission to update this role level." });
//         }

//         // 🔍 **Step 4: Update User Details in `Individuals`**
//         console.log("🛠️ Updating user details...");
//         const [individualUpdatedCount] = await Individuals.update(
//             { username, first_name, last_name },
//             { where: { id: user_id } }
//         );

//         console.log(`✅ Individuals Updated: ${individualUpdatedCount > 0}`);

//         // 🔗 **Step 5: Update User Role in `UserRoles`**
//         console.log("🔗 Updating user role...");
//         const [roleUpdatedCount] = await UserRoles.update(
//             { role_id, updated_by, permissions},
//             { where: { id } }
//         );

//         console.log(`✅ Role Updated: ${roleUpdatedCount > 0}`);

//         if (individualUpdatedCount === 0 && roleUpdatedCount === 0) {
//             console.log("⚠️ No changes made in Individuals or UserRoles.");
//             return res.status(400).json({ message: "No changes made." });
//         }

//         // 🔍 **Step 6: Fetch and return updated user details**
//         const updatedUser = await Individuals.findOne({ where: { id: user_id } });

//         res.status(200).json({ 
//             message: "User updated successfully.", 
//             updatedUser,
//             changes: {
//                 individualUpdated: individualUpdatedCount > 0,
//                 roleUpdated: roleUpdatedCount > 0
//             }
//         });

//     } catch (error) {
//         console.error("❌ Error updating user:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });
router.put("/update-user/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; // This is the UserRoles ID
        const { username, first_name, last_name, role_id, permissions } = req.body;
        const updated_by = req.user.id; // Logged-in user's ID

        console.log(`🔹 Incoming User Update Request for UserRoles ID: ${id}`, req.body);
        
        // 🔍 **Step 1: Check if UserRoles Exists**
        const userRole = await UserRoles.findOne({
            where: { id },
            include: [
                {
                    model: Individuals,
                    as: "user",
                    attributes: ["id", "username", "email", "first_name", "last_name"]
                },
                {
                    model: Roles,
                    as: "role",
                    attributes: ["id", "role_name", "level_name", "parent_role_id"]
                }
            ]
        });

        if (!userRole) {
            console.log("🚨 UserRoles entry not found.");
            return res.status(404).json({ message: "User role record not found." });
        }

        const user_id = userRole.user?.id; // Get user_id from Individuals
        console.log("✅ Extracted User ID:", user_id);

        if (!user_id) {
            console.log("🚨 User ID not found in Individuals.");
            return res.status(404).json({ message: "User record not found." });
        }

        console.log("✅ User exists. Proceeding with role validation...");

        // 🔍 **Step 2: Validate Role**
        const roleData = await Roles.findOne({
            where: { id: role_id },
            attributes: ["level_name"]
        });

        if (!roleData) {
            console.log("🚨 Invalid Role ID. Role not found.");
            return res.status(400).json({ message: "Invalid role ID." });
        }

        console.log(`✅ Role Level of Requested Role: ${roleData.level_name}`);

        // 🔍 **Step 3: Fetch the logged-in user's role level from `UserRoles`**
        const loggedInUserRole = await UserRoles.findOne({
            where: { user_id: updated_by },
            include: [
                {
                    model: Roles,
                    as: "role",
                    attributes: ["id", "role_name", "level_name"]
                }
            ]
        });

        if (!loggedInUserRole) {
            console.log("🚨 Logged-in user's role not found.");
            return res.status(403).json({ message: "Logged-in user's role not found." });
        }

        console.log("Logged-in User Role:", loggedInUserRole.role.level_name);

        const userRoles = await LevelHierarchy.findOne({
            where: { level: loggedInUserRole.role.level_name }
        });

        if (!userRoles) {
            return res.status(403).json({ message: "User level not found." });
        }

        const allowedLevels = Array.isArray(userRoles.can_create) ? userRoles.can_create : [];
        console.log("🚀 Allowed Levels:", allowedLevels.map(level => level.toLowerCase()));

        const isAllowed = allowedLevels.map(level => level.toLowerCase()).includes(roleData.level_name.toLowerCase());
        console.log("✅ Permission Check:", isAllowed);

        if (!isAllowed) {
            console.log("🚨 Permission Denied: You cannot update this role level.");
            return res.status(403).json({ message: "You do not have permission to update this role level." });
        }

        // 🔍 **Step 4: Update User Details in `Individuals`**
        console.log("🛠️ Updating user details...");
        const [individualUpdatedCount] = await Individuals.update(
            { username, first_name, last_name },
            { where: { id: user_id } }
        );

        console.log(`✅ Individuals Updated: ${individualUpdatedCount > 0}`);

        // 🔗 **Step 5: Update User Role in `UserRoles`**
        console.log("🔗 Updating user role...");
        const [roleUpdatedCount] = await UserRoles.update(
            { role_id, updated_by, permissions },
            { where: { id } }
        );

        console.log(`✅ Role Updated: ${roleUpdatedCount > 0}`);

        // 🔗 **Step 6: Update role permissions in `Roles` table**
        console.log("🔗 Updating role permissions...");
        const [rolePermissionsUpdatedCount] = await Roles.update(
            { permissions }, // Update the permissions for the role
            { where: { id: role_id } }
        );

        console.log(`✅ Role Permissions Updated: ${rolePermissionsUpdatedCount > 0}`);

        if (individualUpdatedCount === 0 && roleUpdatedCount === 0 && rolePermissionsUpdatedCount === 0) {
            console.log("⚠️ No changes made in Individuals, UserRoles, or Role Permissions.");
            return res.status(400).json({ message: "No changes made." });
        }

        // 🔍 **Step 7: Fetch and return updated user details**
        const updatedUser = await Individuals.findOne({ where: { id: user_id } });

        res.status(200).json({ 
            message: "User updated successfully.", 
            updatedUser,
            changes: {
                individualUpdated: individualUpdatedCount > 0,
                roleUpdated: roleUpdatedCount > 0,
                rolePermissionsUpdated: rolePermissionsUpdatedCount > 0
            }
        });

    } catch (error) {
        console.error("❌ Error updating user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
    






module.exports = router;


