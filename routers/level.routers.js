// const express = require("express");
// const { LevelHierarchy } = require("../models"); // Import Sequelize model
// console.log("Level hirachy", LevelHierarchy)
// const router = express.Router();

// /**
//  * @swagger
//  * /levelhierarchies/:
//  *   get:
//  *     summary: Get all levels in the hierarchy
//  *     description: Retrieve a list of all levels in the system's hierarchy.
//  *     tags:
//  *       - Level Hierarchy
//  *     responses:
//  *       200:
//  *         description: A list of level hierarchies
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: string
//  *                     example: "a2d3b45f-e9f3-11ef-bc93-6c24086040f8"
//  *                   level_name:
//  *                     type: string
//  *                     example: "Super Admin"
//  *                   level_code:
//  *                     type: string
//  *                     example: "Level 1"
//  *                   can_create:
//  *                     type: array
//  *                     items:
//  *                       type: string
//  *                     example: ["Level 2", "Level 3"]
//  *       500:
//  *         description: Server error
//  */

// router.get("/", async (req, res) => {
//     try {
//         // 🔍 Fetch all levels from the database
//         const levels = await LevelHierarchy.findAll({
//             attributes: ["id", "role_name", "description", "parent_role_id","level", "Permissions","can_create"],
//             include: [
//                 {
//                     model: LevelHierarchy,
//                     as: "ParentRole", // Matches alias in model
//                     attributes: ["id", "role_name"] // Fetch only necessary fields
//                 }
//             ]
//         });

//         // ✅ Return the levels as JSON
//         res.status(200).json(levels);
//     } catch (error) {
//         console.error("❌ Error fetching level hierarchy:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const { LevelHierarchy, Individuals, Roles, UserRoles } = require("../models");
const authenticateToken = require('../middlewaare/auth');

/**
 * @swagger
 * /levelhierarchies/:
 *   get:
 *     summary: Fetch available levels based on the logged-in user's role level
 *     description: Returns the level hierarchy filtered based on the permissions of the logged-in user.
 *     tags:
 *       - Levels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved level hierarchy
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "6e8cc34a-e9f4-11ef-bc93-6c24086040f8"
 *                   role_name:
 *                     type: string
 *                     example: "Manager"
 *                   description:
 *                     type: string
 *                     example: "Can manage employees and oversee operations."
 *                   parent_role_id:
 *                     type: string
 *                     format: uuid
 *                     example: "bc64428b-e9f3-11ef-bc93-6c24086040f8"
 *                   level:
 *                     type: string
 *                     example: "Level 2"
 *                   Permissions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["manage_users", "view_reports"]
 *                   can_create:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Level 3"]
 *       403:
 *         description: User role not found
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Get the logged-in user's ID
        console.log("🔍 Logged-in User ID:", userId);

        // ✅ Fetch the user's role from the `UserRoles` table
        const userRole = await UserRoles.findOne({
            where: { user_id: userId },
            include: [{ model: Roles, as: "role", attributes: ["level_name"] }]
        });

        if (!userRole || !userRole.role) {
            return res.status(403).json({ message: "User role not found." });
        }

        const userLevel = userRole.role.level_name;
        console.log("🔍 Logged-in User Level:", userLevel);

        // ✅ Fetch Level Hierarchy to Get Allowed Levels
        const levelData = await LevelHierarchy.findOne({
            where: { level: userLevel },
            attributes: ["can_create"]
        });

        if (!levelData) {
            return res.status(403).json({ message: "User level hierarchy not found." });
        }

        // ✅ Extract Allowed Levels
        const allowedLevels = Array.isArray(levelData.can_create) ? levelData.can_create : []
        console.log("🚀 Allowed Levels:", allowedLevels);

        // ✅ Fetch all levels the user is allowed to see
        const levels = await LevelHierarchy.findAll({
            where: { level: allowedLevels },
            attributes: ["id", "role_name", "description", "parent_role_id", "level", "Permissions", "can_create"],
            include: [
                {
                    model: LevelHierarchy,
                    as: "ParentRole", // Matches alias in model
                    attributes: ["id", "role_name"] // Fetch only necessary fields
                }
            ]
        });

        console.log("✅ Levels Retrieved Successfully!");
        res.status(200).json(levels);

    } catch (error) {
        console.error("❌ Error fetching level hierarchy:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
