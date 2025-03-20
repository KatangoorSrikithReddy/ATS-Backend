const express = require('express');
const router = express.Router();
const {Applicants} = require('../models');
const authenticateToken = require('../middlewaare/auth');

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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const applicants = await Applicants.findAll();
    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


/**
 * @swagger
 * /applicants:
 *   post:
 *     summary: Create a new applicant
 *     description: Create a new applicant by automatically generating the next applicant ID.
 *     tags:
 *       - Applicants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicant_name
 *               - mobile_number
 *               - email_address
 *               - created_by
 *             properties:
 *               applicant_name:
 *                 type: string
 *                 example: "John Doe"
 *               mobile_number:
 *                 type: string
 *                 example: "+1234567890"
 *               email_address:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               created_by:
 *                 type: string
 *                 example: "uuid-of-creator"
 *               updated_by:
 *                 type: string
 *                 example: "uuid-of-updater"
 *     responses:
 *       201:
 *         description: Applicant created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post("/",  async (req, res) => {
  created_by = "srikith";
  updated_by = "srikith";
  try {
    console.log("This is the request body:", req.body);
    // Fetch the last applicant_id to increment the number
    const lastApplicant = await Applicants.findOne({
      order: [['applicant_id', 'DESC']],
      limit: 1,
    });

    console.log("This is the last applicant:", lastApplicant ? lastApplicant.applicant_id : "No applicants");

    // Default starting applicant_id if no applicants exist
    let newApplicantId = 1;

    // If there is an applicant already, increment the last number
    if (lastApplicant && lastApplicant.applicant_id) {
      newApplicantId = lastApplicant.applicant_id + 1; // Increment the numeric applicant_id by 1
    }

    // Create a new applicant record
    const { applicant_name, mobile_number, email_address} = req.body;

    const newApplicant = await Applicants.create({
      applicant_id: newApplicantId, // Use the newly generated numeric applicant_id
      applicant_name,
      mobile_number,
      email_address,
      created_by,
      updated_by,
    });

    res.status(201).json(newApplicant); // Return the created applicant

  } catch (error) {
    console.error("Error creating applicant:", error);
    res.status(500).json({ message: "Applicant with this email or name  already exists." });
  }
});



/**
 * @swagger
 * /applicants/{id}:
 *   put:
 *     summary: Update an applicant's details
 *     description: Update the details of an existing applicant by their ID.
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the applicant to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicant_name
 *               - mobile_number
 *               - email_address
 *             properties:
 *               applicant_name:
 *                 type: string
 *                 example: "Jane Doe"
 *               mobile_number:
 *                 type: string
 *                 example: "+9876543210"
 *               email_address:
 *                 type: string
 *                 example: "jane.doe@example.com"
 *               updated_by:
 *                 type: string
 *                 example: "uuid-of-updater"
 *     responses:
 *       200:
 *         description: Applicant updated successfully
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the applicant ID from the URL
    const { applicant_name, mobile_number, email_address, updated_by } = req.body; // Get the data to update

    // Find the applicant by id
    const applicant = await Applicants.findOne({ where: { id } });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Update the applicant's details
    applicant.applicant_name = applicant_name || applicant.applicant_name;
    applicant.mobile_number = mobile_number || applicant.mobile_number;
    applicant.email_address = email_address || applicant.email_address;
    applicant.updated_by = updated_by || applicant.updated_by;

    // Save the changes
    await applicant.save();

    res.status(200).json(applicant); // Return the updated applicant

  } catch (error) {
    console.error("Error updating applicant:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
/**
 * @swagger
 * /applicants/{id}:
 *   delete:
 *     summary: Soft delete an applicant
 *     description: Soft delete an applicant by setting their is_active field to false.
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the applicant to be deleted
 *     responses:
 *       200:
 *         description: Applicant successfully deleted
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/softdelete/:id", async (req, res) => {
 
  try {
    const { id } = req.params; // Get the applicant ID from the URL
    console.log("this is request body", req.body)
    // Find the applicant by id
    const applicant = await Applicants.findOne({ where: { id } });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    
    // Check if we want to toggle the status
    const currentStatus = applicant.is_active;
    const newStatus = currentStatus === true ? false : true; // Toggle the current status

    // Update is_active based on the new status
    applicant.is_active = newStatus;
    await applicant.save();

    // Respond based on the new status
    const statusMessage = newStatus ? "reactivated" : "deactivated";
    res.status(200).json({ message: `Applicant successfully ${statusMessage}` });

  } catch (error) {
    console.error("Error updating applicant status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
