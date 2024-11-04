const express = require('express');
const { Client } = require('../models');
const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - client_name
 *         - contacts_number
 *         - email_id
 *         - website
 *         - industry
 *         - country
 *         - city
 *         - business_unit
 *         - category
 *         - postal
 *         - created_by
 *         - created_on
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the client
 *         client_name:
 *           type: string
 *           description: Name of the client
 *         contacts_number:
 *           type: string
 *           description: Contact number of the client
 *         email_id:
 *           type: string
 *           description: Email ID of the client
 *         website:
 *           type: string
 *           description: Website URL of the client
 *         industry:
 *           type: string
 *           description: Industry of the client
 *         country:
 *           type: string
 *           description: Country of the client
 *         saret:
 *           type: string
 *           description: SARET information (if applicable)
 *         city:
 *           type: string
 *           description: City of the client
 *         business_unit:
 *           type: string
 *           description: Business unit of the client
 *         category:
 *           type: string
 *           description: Category of the client
 *         postal:
 *           type: string
 *           description: Postal code of the client
 *         created_by:
 *           type: string
 *           description: Who created the client record
 *         created_on:
 *           type: string
 *           format: date
 *           description: Date when the client was created
 *         is_active:
 *           type: boolean
 *           description: Whether the client is active or not
 *       example:
 *         id: 1
 *         client_name: "John Doe Corp"
 *         contacts_number: "123456789"
 *         email_id: "john@doe.com"
 *         website: "http://johndoe.com"
 *         industry: "Construction"
 *         country: "USA"
 *         saret: "Some info"
 *         city: "New York"
 *         business_unit: "Engineering"
 *         category: "Premium"
 *         postal: "10001"
 *         created_by: "admin"
 *         created_on: "2023-09-30"
 *         is_active: true
 */

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    console.log("created ",newClient)
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Retrieve a list of clients
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of clients returned
 *       - in: query
 *         name: show_inactive
 *         schema:
 *           type: boolean
 *         description: Show inactive clients if true
 *     responses:
 *       200:
 *         description: A list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
    // Extract and convert query parameters
    const { skip = 0, limit = 10, show_inactive = 'false' } = req.query;
    const showInactive = show_inactive === 'true'; // Convert string to boolean
    console.log('Query Parameters:', req.query); // Log the query parameters for debugging
  
    try {
      // Fetch clients with filtering on active status
      const clients = await Client.findAll({
        offset: parseInt(skip),
        limit: parseInt(limit),
        where: showInactive ? {} : { is_active: true } // Filter based on is_active flag
      });
  
      console.log('Retrieved Clients:', clients); // Log the retrieved clients to the console
  
      // Optionally append '(Inactive)' to the client name if show_inactive is false
      if (!showInactive) {
        clients.forEach(client => {
          if (!client.is_active) {
            client.client_name += ' (Inactive)';
          }
        });
      }
  
      res.json(clients); // Send the clients in the response
    } catch (error) {
      console.error('Error fetching clients:', error); // Log any errors that occur
      res.status(500).json({ error: 'Failed to retrieve clients' });
    }
  });
  

/**
 * @swagger
 * /clients/{clientId}:
 *   put:
 *     summary: Update a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the client to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.put('/:clientId', async (req, res) => {
  const { clientId } = req.params;
  
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

/**
 * @swagger
 * /clients/{clientId}:
 *   delete:
 *     summary: Soft delete a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the client to delete
 *     responses:
 *       200:
 *         description: Client deactivated successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.is_active = false;
    await client.save();

    res.json({ message: 'Client deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate client' });
  }
});

module.exports = router;
