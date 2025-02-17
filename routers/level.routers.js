const express = require("express");
const { LevelHierarchy } = require("../models"); // Import Sequelize model
console.log("Level hirachy", LevelHierarchy)
const router = express.Router();

/**
 * @swagger
 * /levelhierarchies/:
 *   get:
 *     summary: Get all levels in the hierarchy
 *     description: Retrieve a list of all levels in the system's hierarchy.
 *     tags:
 *       - Level Hierarchy
 *     responses:
 *       200:
 *         description: A list of level hierarchies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "a2d3b45f-e9f3-11ef-bc93-6c24086040f8"
 *                   level_name:
 *                     type: string
 *                     example: "Super Admin"
 *                   level_code:
 *                     type: string
 *                     example: "Level 1"
 *                   can_create:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Level 2", "Level 3"]
 *       500:
 *         description: Server error
 */

router.get("/", async (req, res) => {
    try {
        // 🔍 Fetch all levels from the database
        const levels = await LevelHierarchy.findAll({
            attributes: ["id", "role_name", "description", "parent_role_id","level", "Permissions","can_create"],
            include: [
                {
                    model: LevelHierarchy,
                    as: "ParentRole", // Matches alias in model
                    attributes: ["id", "role_name"] // Fetch only necessary fields
                }
            ]
        });

        // ✅ Return the levels as JSON
        res.status(200).json(levels);
    } catch (error) {
        console.error("❌ Error fetching level hierarchy:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
