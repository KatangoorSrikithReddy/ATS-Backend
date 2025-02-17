const express = require('express');
// const {  Client } = require('../models');

// const db = require('../models')
// const Clients =  db.Client
const router = express.Router();
// const { JobRequest } = require('../models');

// const { JobRequest } = require('../models'); // Correct import for the JobRequest model
// const jobrequest = db.Jobrequest
const { ClientPage, JobRequest} = require('../models');
const jobrequest = require('../models/jobrequest');
console.log('JobRequest Model:', JobRequest);
console.log('Client Model:', ClientPage);
const authenticateToken = require('../middlewaare/auth');
console.log("Received Token for job request:", authenticateToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     JobRequest:
 *       type: object
 *       required:
 *         - client_id
 *         - job_title
 *         - job_location
 *         - pay_range
 *         - work_mode_type
 *         - job_type
 *         - status
 *         - primary_skills
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the job request
 *         client_id:
 *           type: integer
 *           description: ID of the client
 *         job_title:
 *           type: string
 *           description: Title of the job
 *         job_location:
 *           type: string
 *           description: Location of the job
 *         pay_range:
 *           type: string
 *           description: Pay range for the job
 *         work_mode_type:
 *           type: string
 *           description: Work mode (e.g., Remote, On-site)
 *         job_type:
 *           type: string
 *           description: Type of job (Full-Time, Part-Time)
 *         status:
 *           type: string
 *           description: Status of the job (Open, Closed)
 *         primary_skills:
 *           type: string
 *           description: Primary skills required for the job
 *         immediate_joining:
 *           type: string
 *           description: Whether immediate joining is required
 *         description:
 *           type: string
 *           description: Job description
 *         is_active:
 *           type: boolean
 *           description: Whether the job request is active
 *       example:
 *         id: 1
 *         client_id: 1
 *         job_title: "Software Engineer"
 *         job_location: "Remote"
 *         pay_range: "$80k - $100k"
 *         work_mode_type: "Remote"
 *         job_type: "Full-Time"
 *         status: "Open"
 *         primary_skills: "JavaScript, Node.js"
 *         immediate_joining: "Yes"
 *         description: "Looking for a software engineer"
 *         is_active: true
 */

/**
 * @swagger
 * /job-requests:
 *   post:
 *     summary: Create a new job request
 *     tags: [JobRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobRequest'
 *     responses:
 *       201:
 *         description: Job request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRequest'
 *       500:
 *         description: Failed to create job request
 */
router.post('/', authenticateToken, async (req, res) => {
  console.log("this is different user", req.user);
  try {
    console.log('Request body:', req.body); // Check what data is coming in
    const client = await ClientPage.findByPk(req.body.client_id);
    console.log("This is to test client", client);
    console.log('Found client:', client); // Check if the client exists

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Create the job request
    const jobRequest = await JobRequest.create(req.body);
    console.log('Created job request:', jobRequest); // Check if the job request is created successfully

    // Append client_name to the job request response
    const jobRequestWithClientName = {
      ...jobRequest.toJSON(), // Convert the jobRequest instance to a plain object
      client_name: client.client_name // Append client_name from the client instance
    };

    // Send the job request response with client_name included
    res.status(201).json(jobRequestWithClientName);
  } catch (error) {
    console.error('Error creating job request:', error);
    res.status(500).json({ error: 'Failed to create job request' });
  }
});

/**
 * @swagger
 * /job-requests:
 *   get:
 *     summary: Retrieve all job requests
 *     tags: [JobRequests]
 *     responses:
 *       200:
 *         description: A list of job requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobRequest'
 *       500:
 *         description: Failed to retrieve job requests
 */

router.get('/', authenticateToken, async (req, res) => {
  console.log("is it working");
  console.log("testing", JobRequest);
  console.log("testing", ClientPage);

  try {
    const jobRequests = await JobRequest.findAll({
      attributes: [
        'id', 'job_title', 'job_location', 'pay_range', 'work_mode_type', 'job_type',
        'status', 'primary_skills', 'immediate_joining', 'description', 'is_active', 'client_id' // Include client_id
      ],  // Select only the necessary fields from JobRequest
      include: [{
        model: ClientPage,  // Include the Client model
        as: 'client',   // This alias must match the alias defined in JobRequest.associate
        attributes: ['client_name']  // Only fetch the client_name field from the Client model
      }],
    });

    // Format the response with both client_id and client_name directly included
    const formattedJobRequests = jobRequests.map(jobRequest => ({
      id: jobRequest.id,
      client_id: jobRequest.client_id,  // Include client_id
      job_title: jobRequest.job_title,
      job_location: jobRequest.job_location,
      pay_range: jobRequest.pay_range,
      work_mode_type: jobRequest.work_mode_type,
      job_type: jobRequest.job_type,
      status: jobRequest.status,
      primary_skills: jobRequest.primary_skills,
      immediate_joining: jobRequest.immediate_joining,
      description: jobRequest.description,
      is_active: jobRequest.is_active,
      client_name: jobRequest.client.client_name  // Include client_name from the associated Client model
    }));

    // Send the formatted result back as a JSON response
    res.json(formattedJobRequests);
  } catch (error) {
    console.error('Error fetching job requests:', error); // Log the error to the console
    res.status(500).json({ error: 'Failed to retrieve job requests', details: error.message });
  }
});


/**
 * @swagger
 * /job-requests/{jobRequestId}:
 *   get:
 *     summary: Retrieve a single job request by ID
 *     tags: [JobRequests]
 *     parameters:
 *       - in: path
 *         name: jobRequestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job request to retrieve
 *     responses:
 *       200:
 *         description: A job request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRequest'
 *       404:
 *         description: Job request not found
 *       500:
 *         description: Failed to retrieve job request
 */
router.get('/:jobRequestId', async (req, res) => {
  try {
    const jobRequest = await JobRequest.findByPk(req.params.jobRequestId, {
      include: [{ model: ClientPage, as: 'client' }]
    });
    if (!jobRequest) {
      return res.status(404).json({ error: 'Job Request not found' });
    }

    res.json(jobRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve job request' });
  }
});

/**
 * @swagger
 * /job-requests/{jobRequestId}:
 *   put:
 *     summary: Update a job request
 *     tags: [JobRequests]
 *     parameters:
 *       - in: path
 *         name: jobRequestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job request to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobRequest'
 *     responses:
 *       200:
 *         description: Job request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRequest'
 *       404:
 *         description: Job request not found
 *       500:
 *         description: Failed to update job request
 */
router.put('/:jobRequestId', authenticateToken, async (req, res) => {
  try {
    const jobRequest = await JobRequest.findByPk(req.params.jobRequestId);

    if (!jobRequest) {
      return res.status(404).json({ error: 'Job Request not found' });
    }

    // Update the job request
    await jobRequest.update(req.body);

    // Fetch the client associated with the job request
    const client = await ClientPage.findByPk(jobRequest.client_id);

    // Send the updated job request with client_name included
    res.json({
      ...jobRequest.toJSON(),
      client_name: client ? client.client_name : null  // Include client_name
    });
  } catch (error) {
    console.error('Error updating job request:', error);
    res.status(500).json({ error: 'Failed to update job request' });
  }
});


/**
 * @swagger
 * /job-requests/{jobRequestId}:
 *   delete:
 *     summary: Delete a job request (soft delete)
 *     tags: [JobRequests]
 *     parameters:
 *       - in: path
 *         name: jobRequestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job request to delete
 *     responses:
 *       200:
 *         description: Job request deactivated successfully
 *       404:
 *         description: Job request not found
 *       500:
 *         description: Failed to delete job request
 */
router.delete('/:jobRequestId', async (req, res) => {
  try {
    const jobRequest = await JobRequest.findByPk(req.params.jobRequestId);
    if (!jobRequest) {
      return res.status(404).json({ error: 'Job Request not found' });
    }

    jobRequest.is_active = false;
    await jobRequest.save();
    res.json({ message: 'Job Request deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job request' });
  }
});

module.exports = router;
