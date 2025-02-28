const express = require('express');
const router = express.Router();
const { Roles, UserRoles, LevelHierarchy } = require("../models");
const authenticateToken = require("../middlewaare/auth");
const { Op } = require("sequelize");
/**
 * @swagger
 * /roles/create-role:
 *   post:
 *     summary: Create a new role based on level hierarchy
 *     description: Allows users to create roles if they have permission based on their hierarchy level.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *               - level_code
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Finance Super Admin"
 *               description:
 *                 type: string
 *                 example: "Manages finance teams"
 *               level_code:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role created successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "UUID-1234"
 *                     role_name:
 *                       type: string
 *                       example: "Finance Super Admin"
 *                     level_code:
 *                       type: string
 *                       example: "1"
 *                     created_by:
 *                       type: string
 *                       example: "UUID-5678"
 *       403:
 *         description: User does not have permission to create this role level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to create this role level."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

// router.post("/create-role", async (req, res) => {
//     try {
//         const { role_name, description, level_code, permissions, parent_role_id, created_by } = req.body;
//         // const created_by = req.user.id; // ✅ Assume logged-in user ID

//         // ✅ Fetch User's Role & Allowed Levels
//         const userRole = await LevelHierarchy.findOne({
//             // where: { level_code: req.user.level_code }
//             // where: { level: "Level 0" }
//         });

//         if (!userRole) {
//             return res.status(403).json({ message: "User level not found." });
//         }

//         const allowedLevels = JSON.parse(userRole.can_create); // ✅ Example: ["1", "2"]

//         // ✅ Check if user can create this level
//         if (!allowedLevels.includes(level_code)) {
//             return res.status(403).json({ message: "You do not have permission to create this role level." });
//         }

//         // ✅ Create New Role
//         const newRole = await Roles.create({
//             id: require("uuid").v4(),
//             role_name,
//             description,
//             level_code, // ✅ Stores level but no FK
//             created_by,
//             parent_role_id,
//             permissions
//         });

//         res.status(201).json({ message: "Role created successfully", role: newRole });
//     } catch (error) {
//         console.error("Error creating role:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// module.exports = router;


    router.post("/create-role", authenticateToken, async (req, res) => {
        try {
            const loggedInUserId = req.user.id;
            console.log("🔥 Incoming Request Body:", req.body);
            // const { role_name, description, level_code, permissions} = req.body;
            const { role_name, description, level_code, permissions, parent_role_id } = req.body;

            const userRoleid = await UserRoles.findOne({
                where: { user_id: loggedInUserId },
                include: [{ model: Roles, as: "role" }]
            });

            console.log("this is to test", userRoleid.role.id);

       
            const userRole = await LevelHierarchy.findOne({
                where: { level: userRoleid.role.level_name} // Either Logged-in user or Dummy Chidhagni
            });
            console.log("User 's Role:", userRole);

            if (!userRole) {
                return res.status(403).json({ message: "User level not found." });
            }

            console.log("users role can access",userRole.can_create  )

            // const allowedLevels = JSON.parse(userRole.can_create || "[]"); 
            const allowedLevels = Array.isArray(userRole.can_create) ? userRole.can_create : [];
            console.log("🚀 Allowed Levels:", allowedLevels);
            // console.log("users role can access",userRole.can_create  )
            console.log("🛠️ Type of allowedLevels:", typeof allowedLevels);
            console.log("🚀 Allowed Levels:", allowedLevels);
            console.log("🔍 Requested Level Code:", level_code);
            console.log("✅ Condition Check:", allowedLevels.includes(level_code));

            if (!allowedLevels.map(level => level.toLowerCase()).includes(level_code.toLowerCase())) {
                return res.status(403).json({ message: "You do not have permission to create this role level." });
            }

            // ✅ Create New Role
            // const newRole = await Roles.create({
            //     id: require("uuid").v4(),
            //     role_name,
            //     description,
            //     level_name : level_code, // ✅ Stores level but no FK
            //     created_by: loggedInUserId ,
            //     parent_role_id : userRoleid.role.id,
            //     permissions
            // });
            // const finalParentRoleId = userRoleid.role.level_name === "Level 0" ? parent_role_id : userRoleid.role.id;
            // console.log("🆕 Parent Role ID Assigned:", finalParentRoleId);
            const finalParentRoleId = 
            userRoleid.role.level_name === "Level 0" 
            ? (parent_role_id ?? userRoleid.role.id) // If parent_role_id is null, use userRoleid.role.id
            : userRoleid.role.id;

        console.log("🆕 Parent Role ID Assigned:", finalParentRoleId);

            console.log("🔍 Role Level Name:", userRoleid.role.level_name);
console.log("🔍 Parent Role ID (Before):", parent_role_id);
console.log("🔍 User Role ID:", userRoleid.role.id);
console.log("🆕 Parent Role ID Assigned:", finalParentRoleId);

            // ✅ Create New Role
            const newRole = await Roles.create({
                id: require("uuid").v4(),
                role_name,
                description,
                level_name: level_code, 
                created_by: loggedInUserId,
                parent_role_id: finalParentRoleId,
                permissions
            });

            

            res.status(201).json({ message: "Role created successfully", role: newRole });
        } catch (error) {
            console.error("Error creating role:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });



/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles available in the system.
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "d9b2d63d-a233-4123-847e-145d42a2318b"
 *                   role_name:
 *                     type: string
 *                     example: "Admin"
 *                   description:
 *                     type: string
 *                     example: "System administrator with full access"
 *                   level_name:
 *                     type: string
 *                     example: "Level 1"
 *       500:
 *         description: Server error
 */

// router.get("/", async (req, res) => {
//     try {
//         // 🔍 Fetch all roles from the database
//         const roles = await Roles.findAll({
//             attributes: ["id", "role_name", "description", "level_name", "permissions"],
//             include: [
//                 {
//                     model: Roles,
//                     as: "ParentRole",
//                     attributes: ["id", "role_name"]
//                 }]
//         });

//         // ✅ Return the roles as JSON
//         res.status(200).json(roles);
//     } catch (error) {
//         console.error("❌ Error fetching roles:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });
// router.get("/", authenticateToken, async (req, res) => {
//     try {
//         const loggedInUserId = req.user.id;

//         // Fetch User Role
//         const userRole = await UserRoles.findOne({
//             where: { user_id: loggedInUserId },
//             include: [{ model: Roles, as: "role" }]
//         });

//         if (!userRole) {
//             return res.status(403).json({ message: "User role not found." });
//         }

//         let rolesQuery = {};

//         if (userRole.role.level_name === "Level 0") {
//             // Chidhagni sees all roles
//             console.log("✅ Chidhagni Access: Fetching all roles...");
//             rolesQuery = {};
//         } else if (userRole.role.level_name === "Level 1") {
//             // Super Admin sees their created users and admins under their parent_role_id
//             console.log("✅ Super Admin Access: Fetching roles created by this user...");
//             rolesQuery = {
//                 [Op.or]: [
//                     { created_by: loggedInUserId },
//                     { parent_role_id: userRole.role.id }
//                 ]
//             };
//         } else {
//             console.log("❌ Access Denied: User does not have permission to view roles.");
//             return res.status(403).json({ message: "You do not have permission to view these roles." });
//         }

//         const roles = await Roles.findAll({
//             where: rolesQuery,
//             include: [{
//                 model: Roles,
//                 as: "ParentRole",
//                 attributes: ["id", "role_name"]
//             }]
//         });

//         res.status(200).json(roles);

//     } catch (error) {
//         console.error("❌ Error fetching roles:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

router.get("/", authenticateToken, async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        // Fetch the user's role
        const userRole = await UserRoles.findOne({
            where: { user_id: loggedInUserId },
            include: [{
                model: Roles,
                as: "role",
                attributes: ["id", "role_name", "level_name", "parent_role_id", "is_active"] // Fields from `Roles`
            }],
            attributes: ["id", "role_id"] // Fetch `role_id` from `UserRoles`
        });
        
        if (!userRole || !userRole.role) {
            console.log("❌ User role not found.");
        } else {
            console.log(`
            ✅ User Role Details:
            -----------------------
            UserRoles ID: ${userRole.id}
            Role ID: ${userRole.role_id}  (Foreign Key)
            Role Name: ${userRole.role.role_name}
            Level Name: ${userRole.role.level_name}
            Parent Role ID: ${userRole.role.parent_role_id}
            Active: ${userRole.role.is_active}
            `);
        }
        let rolesQuery = {};

        if (userRole.role.level_name === "Level 0") {
            // Chidhagni: Fetch all roles
            console.log("✅ Chidhagni Access: Fetching all roles...");
            rolesQuery = {
                level_name: { [Op.ne]: "Level 0" } // Exclude all Level 0 roles
            };
        } else {
            // Dynamically fetch roles based on the logged-in user's role
            console.log(`✅ Fetching roles created by user ${loggedInUserId} or under their hierarchy...`);
            rolesQuery = {
                [Op.or]: [
                    { created_by: loggedInUserId },  // Fetch roles created by this user
                    { parent_role_id: userRole.role.id } // Fetch roles under this user's role
                ]
            };
        }

        // Fetch the roles
        const roles = await Roles.findAll({
            where: rolesQuery,
            include: [
                {
                    model: Roles,
                    as: "ParentRole",
                    attributes: ["id", "role_name"]
                }
            ]
        });

        res.status(200).json(roles);

    } catch (error) {
        console.error("❌ Error fetching roles:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update an existing role
 *     description: Updates a role's name, description, level, permissions, and parent role.
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the role to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *               - level_code
 *               - updated_by
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Updated Admin"
 *                 description: Name of the role.
 *               description:
 *                 type: string
 *                 example: "Updated role with additional permissions"
 *                 description: Description of the role.
 *               level_code:
 *                 type: string
 *                 example: "Level 1"
 *                 description: The level associated with the role.
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: 
 *                   - name: "manage_users"
 *                     children: 
 *                       - name: "delete_roles"
 *                         type: "PAGE"
 *                         permissions: 15
 *               parent_role_id:
 *                 type: string
 *                 format: uuid
 *                 example: "bc64428b-e9f3-11ef-bc93-6c24086040f8"
 *                 description: Parent role ID for role hierarchy.
 *               updated_by:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *                 description: The ID of the user updating the role.
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "6e8cc34a-e9f4-11ef-bc93-6c24086040f8"
 *                     role_name:
 *                       type: string
 *                       example: "Updated Admin"
 *                     description:
 *                       type: string
 *                       example: "Updated role with additional permissions"
 *                     level_name:
 *                       type: string
 *                       example: "Level 1"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: 
 *                         - name: "manage_users"
 *                           children: 
 *                             - name: "delete_roles"
 *                               type: "PAGE"
 *                               permissions: 15
 *                     parent_role_id:
 *                       type: string
 *                       format: uuid
 *                       example: "bc64428b-e9f3-11ef-bc93-6c24086040f8"
 *                     updated_by:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Invalid role ID or missing required fields.
 *       403:
 *         description: User does not have permission to update this role.
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Server error.
 */

router.put("/:id", authenticateToken, async (req, res) => {
    console.log("checking for update role");
    console.log("checking for update role"); // 🔍 Debugging Log
 
    try {
        const loggedInUserId = req.user.id;
        const { id } = req.params;
        console.log("🔥 Incoming Role Update Request for ID:", id);
        console.log("📥 Request Body:", req.body);
        
        const { role_name, description, level_code, permissions,updated_by, parent_role_id } = req.body;

        // ✅ Simulate Chidhagni (If No User Found)
        // const user = req.user || {
        //     id: "0000-1111-2222-3333", // Dummy Chidhagni ID
        //     level_name: "Level 0", // Chidhagni Level
        //     role_name: "Chidhagni" // Chidhagni Role
        // };

        // console.log("User making request:", user);
        const userRoleid = await UserRoles.findOne({
            where: { user_id: loggedInUserId },
            include: [{ model: Roles, as: "role" }]
        });

        // ✅ Fetch User's Role & Allowed Levels
        const userRole = await LevelHierarchy.findOne({
            where: { level: userRoleid.role.level_name } // Either Logged-in user or Dummy Chidhagni
        });
        console.log("🔍 User Role Data:", userRole);

        if (!userRole) {
            return res.status(403).json({ message: "User level not found." });
        }

        // ✅ Extract allowed levels
        const allowedLevels = Array.isArray(userRole.can_create) ? userRole.can_create : [];
        console.log("🚀 Allowed Levels:", allowedLevels);
        console.log("🔍 Requested Level Code:", level_code);
        console.log("✅ Condition Check:", allowedLevels.map(level => level.toLowerCase()).includes(level_code.toLowerCase()));

        // ✅ Check if user has permission to update this role
        if (!allowedLevels.map(level => level.toLowerCase()).includes(level_code.toLowerCase())) {
            return res.status(403).json({ message: "You do not have permission to update this role level." });
        }

        // ✅ Check if Role Exists Before Updating
        const existingRole = await Roles.findOne({ where: { id } });
        console.log("existing role ", existingRole.parent_role_id    )
        
        if (!existingRole) {
            return res.status(404).json({ message: "Role not found." });
        }

        const finalParentRoleId = parent_role_id || existingRole.parent_role_id;
        console.log("🆕 Parent Role ID Assigned:", finalParentRoleId);

        // ✅ Update Role Data
        await Roles.update(
            {
                role_name,
                description,
                level_name: level_code, // ✅ Stores level but no FK
                updated_by,
                parent_role_id: finalParentRoleId, // ✅ Ensure correct parent role is updated
                permissions
            },
            { where: { id } }
        );


        // ✅ Fetch Updated Role
        const updatedRole = await Roles.findOne({ where: { id } });

        res.status(200).json({ message: "Role updated successfully", role: updatedRole });

    } catch (error) {
        console.error("❌ Error updating role:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



/**
 * @swagger
 * /roles/delete-role/{id}:
 *   delete:
 *     summary: Delete a role
 *     description: Deletes a role by ID if the user has permission.
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the role to delete.
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role deleted successfully"
 *       403:
 *         description: User does not have permission to delete this role.
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Server error.
 */

router.delete("/delete-role/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🔥 Deleting Role ID:", id);

        // ✅ Check if Role Exists
        const existingRole = await Roles.findOne({ where: { id } });

        if (!existingRole) {
            return res.status(404).json({ message: "Role not found." }); // ✅ Prevents multiple responses
        }

        // ✅ Simulate Chidhagni (If No User Found)
        const user = req.user || {
            id: "0000-1111-2222-3333", // Dummy Chidhagni ID
            level_name: "Level 0", // Chidhagni Level
            role_name: "Chidhagni" // Chidhagni Role
        };

        console.log("User attempting delete:", user);

        // ✅ Fetch User's Role & Allowed Delete Levels
        const userRole = await LevelHierarchy.findOne({
            where: { level: user.level_name } // Either Logged-in user or Dummy Chidhagni
        });

        if (!userRole) {
            return res.status(403).json({ message: "User level not found." }); // ✅ Prevents multiple responses
        }

        const allowedLevels = Array.isArray(userRole.can_create) ? userRole.can_create : [];
        console.log("🚀 Allowed Levels for Deletion:", allowedLevels);
        console.log("🔍 Role Level of Role to Delete:", existingRole.level_name);
        console.log("✅ Condition Check:", allowedLevels.includes(existingRole.level_name));

        // ✅ Permission Check
        if (!allowedLevels.includes(existingRole.level_name)) {
            return res.status(403).json({ message: "You do not have permission to delete this role." }); // ✅ Prevents multiple responses
        }

        // ✅ Delete Role
        await Roles.destroy({ where: { id } });

        console.log("✅ Role Deleted Successfully:", id);
        return res.status(200).json({ message: "Role deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting role:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});



/**
 * @swagger
 * /roles/level1:
 *   get:
 *     summary: Retrieve all Level 1 roles
 *     description: Fetches all roles with level_name as "Level 1".
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: A list of Level 1 roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 2
 *                   role_name:
 *                     type: string
 *                     example: "HR Management Super Admin"
 *                   level_name:
 *                     type: string
 *                     example: "Level 1"
 *                   parent_role_id:
 *                     type: integer
 *                     example: 1
 *                   is_active:
 *                     type: boolean
 *                     example: true
 *                   ParentRole:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       role_name:
 *                         type: string
 *                         example: "Chidhagni"
 *       500:
 *         description: Internal server error
 */
router.get("/level1", authenticateToken, async (req, res) => {
    try {
        console.log("🔍 Fetching Level 1 Roles...");

        const level1Roles = await Roles.findAll({
            where: { level_name: "Level 1" }, 
            attributes: ["id", "role_name", "level_name", "parent_role_id", "is_active"],
            include: [
                {
                    model: Roles,
                    as: "ParentRole",
                    attributes: ["id", "role_name"]
                }
            ]
        });

        console.log("✅ Level 1 Roles Retrieved:", level1Roles.map(role => ({
            id: role.id,
            role_name: role.role_name,
            level_name: role.level_name,
            parent_role_id: role.parent_role_id
        })));

        res.status(200).json(level1Roles);

    } catch (error) {
        console.error("❌ Error fetching Level 1 roles:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;






module.exports = router;