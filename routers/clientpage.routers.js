// const express = require('express');
// const { ClientPage, Contact } = require('../models'); // Assuming ClientPage is your Sequelize model
// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: ClientPages
//  *   description: API for managing client pages
//  */

// /**
//  * @swagger
//  * /client-page:
//  *   post:
//  *     summary: Create a new client page
//  *     tags: [ClientPages]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - client_name
//  *               - contacts_number
//  *               - email_id
//  *               - address
//  *               - country
//  *               - state
//  *               - city
//  *               - postal_code
//  *               - website
//  *               - status
//  *               - primary_owner
//  *               - about_company
//  *               - industry
//  *             properties:
//  *               client_name:
//  *                 type: string
//  *                 example: "Tech Solutions"
//  *               contacts_number:
//  *                 type: string
//  *                 example: "1234567890"
//  *               email_id:
//  *                 type: string
//  *                 example: "info@techsolutions.com"
//  *               address:
//  *                 type: string
//  *                 example: "123 Tech Street"
//  *               country:
//  *                 type: string
//  *                 example: "USA"
//  *               state:
//  *                 type: string
//  *                 example: "California"
//  *               city:
//  *                 type: string
//  *                 example: "San Francisco"
//  *               postal_code:
//  *                 type: string
//  *                 example: "94107"
//  *               website:
//  *                 type: string
//  *                 example: "http://techsolutions.com"
//  *               status:
//  *                 type: string
//  *                 example: "Active"
//  *               primary_owner:
//  *                 type: string
//  *                 example: "John Doe"
//  *               about_company:
//  *                 type: string
//  *                 example: "Tech Solutions is a leading tech company."
//  *               industry:
//  *                 type: string
//  *                 example: "Technology"
//  *     responses:
//  *       201:
//  *         description: ClientPage created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "ClientPage created successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/ClientPage'
//  *       500:
//  *         description: Error creating client page
//  */
// router.post('/', async (req, res) => {
//   try {
//     const {
//       client_name,
//       contacts_number,
//       email_id,
//       address,
//       country,
//       state,
//       city,
//       postal_code,
//       website,
//       status,
//       primary_owner,
//       about_company,
//       industry,
//     } = req.body;

//     const newClientPage = await ClientPage.create({
//       client_name,
//       contacts_number,
//       email_id,
//       address,
//       country,
//       state,
//       city,
//       postal_code,
//       website,
//       status,
//       primary_owner,
//       about_company,
//       industry,
//     });

//     res.status(201).json({
//       message: 'ClientPage created successfully',
//       data: newClientPage,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error creating client page',
//       error: error.message,
//     });
//   }
// });

// /**
//  * @swagger
//  * /client-page:
//  *   get:
//  *     summary: Get a list of all client pages
//  *     tags: [ClientPages]
//  *     responses:
//  *       200:
//  *         description: List of all client pages
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/ClientPage'
//  *       500:
//  *         description: Error fetching client pages
//  */
// router.get('/', async (req, res) => {
//   try {
//     const clientPages = await ClientPage.findAll();
//     res.status(200).json(clientPages);
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error fetching client pages',
//       error: error.message,
//     });
//   }
// });
// /**
//  * @swagger
//  * /client-page/getall:
//  *   get:
//  *     summary: Get all client pages
//  *     tags: [ClientPages]
//  *     responses:
//  *       200:
//  *         description: List of ClientPages with contacts
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/ClientPage'
//  *       500:
//  *         description: Error fetching client pages
//  */
// router.get('/getall', async (req, res) => {
//     try {
//       const clientPages = await ClientPage.findAll({
//         include: [
//           {
//             model: Contact, // Include the Contact model
//             as: 'contacts',
//           },
//         ],
//       });
  
//       res.status(200).json(clientPages);
//     } catch (error) {
//       res.status(500).json({
//         message: 'Error fetching client pages',
//         error: error.message,
//       });
//     }
//   });
  

// /**
//  * @swagger
//  * /client-page/{id}:
//  *   put:
//  *     summary: Update an existing client page by ID (without modifying contacts)
//  *     tags: [ClientPages]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: integer
//  *         required: true
//  *         description: The ID of the client page to update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               client_name:
//  *                 type: string
//  *                 example: "Updated Tech Solutions"
//  *               contacts_number:
//  *                 type: string
//  *                 example: "9876543210"
//  *               email_id:
//  *                 type: string
//  *                 example: "updated@techsolutions.com"
//  *               address:
//  *                 type: string
//  *                 example: "456 Updated Street"
//  *               country:
//  *                 type: string
//  *                 example: "India"
//  *               state:
//  *                 type: string
//  *                 example: "Karnataka"
//  *               city:
//  *                 type: string
//  *                 example: "Mysore"
//  *               postal_code:
//  *                 type: string
//  *                 example: "941072"
//  *               website:
//  *                 type: string
//  *                 example: "http://updatedtechsolutions.com"
//  *               status:
//  *                 type: string
//  *                 example: "Inactive"
//  *               primary_owner:
//  *                 type: string
//  *                 example: "Jane Doe"
//  *               about_company:
//  *                 type: string
//  *                 example: "Updated Tech Solutions is a leading tech company."
//  *               industry:
//  *                 type: string
//  *                 example: "Technology"
//  *     responses:
//  *       200:
//  *         description: ClientPage updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "ClientPage updated successfully"
//  *                 data:
//  *                   type: object
//  *                   $ref: '#/components/schemas/ClientPage'
//  *       404:
//  *         description: ClientPage not found
//  *       500:
//  *         description: Error updating client page
//  */

// router.put('/:id', async (req, res) => {
//     try {
//       const { id } = req.params;
//       const {
//         client_name,
//         contacts_number,
//         email_id,
//         address,
//         country,
//         state,
//         city,
//         postal_code,
//         website,
//         status,
//         primary_owner,
//         about_company,
//         industry
//       } = req.body;
  
//       // Find the existing client page
//       const clientPage = await ClientPage.findByPk(id);
  
//       if (!clientPage) {
//         return res.status(404).json({ message: 'ClientPage not found' });
//       }
  
//       // Update the client page fields (but not contacts)
//       await clientPage.update({
//         client_name,
//         contacts_number,
//         email_id,
//         address,
//         country,
//         state,
//         city,
//         postal_code,
//         website,
//         status,
//         primary_owner,
//         about_company,
//         industry,
//       });
  
//       res.status(200).json({
//         message: 'ClientPage updated successfully',
//         data: clientPage,
//       });
//     } catch (error) {
//       res.status(500).json({
//         message: 'Error updating client page',
//         error: error.message,
//       });
//     }
//   });


//   module.exports = router;
























const express = require('express');
const { ClientPage , Contact} = require('../models');
const router = express.Router();

const authenticateToken = require('../middlewaare/auth');


















/**
 * @swagger
 * tags:
 *   name: ClientPage
 *   description: API for managing client pages
 */

/**
 * @swagger
 * /client-page:
 *   post:
 *     summary: Create a new ClientPage
 *     tags: [ClientPage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *                 example: "Tech Solutions"
 *               contacts_number:
 *                 type: string
 *                 example: "1234567890"
 *               email_id:
 *                 type: string
 *                 example: "info@techsolutions.com"
 *               address:
 *                 type: string
 *                 example: "123 Tech Street"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 example: "California"
 *               city:
 *                 type: string
 *                 example: "San Francisco"
 *               postal_code:
 *                 type: string
 *                 example: "94107"
 *               website:
 *                 type: string
 *                 example: "http://techsolutions.com"
 *               status:
 *                 type: string
 *                 example: "Active"
 *               primary_owner:
 *                 type: string
 *                 example: "John Doe"
 *               about_company:
 *                 type: string
 *                 example: "Tech Solutions is a leading tech company."
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               category:
 *                 type: string
 *                 example: "Software"
 *               client_visibility:
 *                 type: boolean
 *                 example: true
 *               feral_id:
 *                 type: string
 *                 example: "1234-5678"
 *     responses:
 *       201:
 *         description: ClientPage created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ClientPage created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ClientPage'
 *       500:
 *         description: Error creating client page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating client page"
 *                 error:
 *                   type: string
 */
router.post('/', authenticateToken, async (req, res) => {
    console.log("Authorixation token", authenticateToken)
  try {
    const {
      client_name,
      contacts_number,
      email_id,
      address,
      country,
      state,
      city,
      postal_code,
      website,
      status,
      primary_owner,
      about_company,
      industry,
      category,
      client_visibility,
      fedral_id,
    } = req.body;

    const created_by = req.user.fullName;   

    const newClientPage = await ClientPage.create({
      client_name,
      contacts_number,
      email_id,
      address,
      country,
      state,
      city,
      postal_code,
      website,
      status,
      primary_owner,
      about_company,
      industry,
      category,
      client_visibility,
      fedral_id,
      created_by,
    });

    res.status(201).json({
      message: 'ClientPage created successfully',
      data: newClientPage,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating client page',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /client-page:
 *   get:
 *     summary: Get all ClientPages with related contacts
 *     tags: [ClientPage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all client pages with contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   client_name:
 *                     type: string
 *                     example: "Tech Solutions"
 *                   contacts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         contact_name:
 *                           type: string
 *                           example: "John Doe"
 *                         phone:
 *                           type: string
 *                           example: "1234567890"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *       500:
 *         description: Error fetching client pages
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
      const clientPages = await ClientPage.findAll({
        include: [
          {
            model: Contact,   // Including the Contact model
            as: 'contacts',   // Alias defined in the association
          },
        ],
      });
  
      res.status(200).json(clientPages);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching client pages',
        error: error.message,
      });
    }
  });
  
  
  /**
   * @swagger
   * /client-page/{id}:
   *   put:
   *     summary: Update a ClientPage by ID
   *     tags: [ClientPage]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The ID of the client page to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               client_name:
   *                 type: string
   *                 example: "Updated Tech Solutions"
   *               contacts_number:
   *                 type: string
   *                 example: "9876543210"
   *               email_id:
   *                 type: string
   *                 example: "updated@techsolutions.com"
   *               address:
   *                 type: string
   *                 example: "456 Updated Street"
   *               country:
   *                 type: string
   *                 example: "India"
   *               state:
   *                 type: string
   *                 example: "Karnataka"
   *               city:
   *                 type: string
   *                 example: "Mysore"
   *               postal_code:
   *                 type: string
   *                 example: "941072"
   *               website:
   *                 type: string
   *                 example: "http://updatedtechsolutions.com"
   *               status:
   *                 type: string
   *                 example: "Inactive"
   *               primary_owner:
   *                 type: string
   *                 example: "Jane Doe"
   *               about_company:
   *                 type: string
   *                 example: "Updated Tech Solutions is a leading tech company."
   *               industry:
   *                 type: string
   *                 example: "Technology"
   *     responses:
   *       200:
   *         description: ClientPage updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "ClientPage updated successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ClientPage'
   *       404:
   *         description: ClientPage not found
   *       500:
   *         description: Error updating client page
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    console.log("this is the update page")
    try {
      const { id } = req.params;
      const {
        client_name,
        contacts_number,
        email_id,
        address,
        country,
        state,
        city,
        postal_code,
        website,
        status,
        primary_owner,
        about_company,
        industry,
        client_visibility,
        fedral_id,
      } = req.body;
  
      // Find the client page by ID
      const clientPage = await ClientPage.findByPk(id);
  
      if (!clientPage) {
        return res.status(404).json({ message: 'ClientPage not found' });
      }
  
      // Update the client page
      await clientPage.update({
        client_name,
        contacts_number,
        email_id,
        address,
        country,
        state,
        city,
        postal_code,
        website,
        status,
        primary_owner,
        about_company,
        industry,
        client_visibility,
        fedral_id,
      });
  
      res.status(200).json({
        message: 'ClientPage updated successfully',
        data: clientPage,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating client page',
        error: error.message,
      });
    }
  });
  
/**
 * @swagger
 * /client-page/delete/{id}:
 *   put:
 *     summary: Soft delete a ClientPage by marking it as inactive
 *     tags: [ClientPage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the client page to soft delete
 *     responses:
 *       200:
 *         description: ClientPage marked as inactive successfully
 *       404:
 *         description: ClientPage not found
 *       500:
 *         description: Error marking client page as inactive
 */
router.put('/delete/:id', authenticateToken, async (req, res) => {
  console.log("this is thedelete page")
  try {
    const { id } = req.params;

    // Find the client page by ID
    const clientPage = await ClientPage.findByPk(id);

    if (!clientPage) {
      return res.status(404).json({ message: 'ClientPage not found' });
    }

    // Perform a soft delete by updating the `status` and `is_active` field
    await clientPage.update({
      status: 'Inactive',  // Update the status field to 'Inactive'
      is_active: false,    // Set the `is_active` field to false to indicate soft deletion
    });

    res.status(200).json({
      message: 'ClientPage marked as inactive successfully',
      clientPage  // Return the updated clientPage object
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error marking client page as inactive',
      error: error.message,
    });
  }
});

module.exports = router;
