const express = require('express');
const router = express.Router();
const {Applicants} = require('../models');

console.log("this is applicant", Applicants)


/**
 * @swagger
 * /applicants:
 *   get:
 *     summary: Retrieve a list of applicants
 *     description: Get a list of all applicants stored in the database.
 *     tags:
 *       - Applicants
 *     responses:
 *       200:
 *         description: List of applicants retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   applicant_id:
 *                     type: string
 *                     example: "A12345"
 *                   applicant_name:
 *                     type: string
 *                     example: "John Doe"
 *                   mobile_number:
 *                     type: string
 *                     example: "+1234567890"
 *                   email_address:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   created_by:
 *                     type: string
 *                     example: "uuid-of-creator"
 *                   updated_by:
 *                     type: string
 *                     example: "uuid-of-updater"
 *       500:
 *         description: Internal Server Error
 */
router.get("/", async (req, res) => {
  try {
    const applicants = await Applicants.findAll();
    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
