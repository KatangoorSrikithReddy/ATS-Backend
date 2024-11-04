
const express = require('express');
const { ClientPage , Contact} = require('../models');
const router = express.Router();

const authenticateToken = require('../middlewaare/auth');

/**
 * @swagger
 * /clientcontact:
 *   post:
 *     summary: Add contact information for a client
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 client_id:
 *                   type: integer
 *                   example: 1
 *                 contact_person:
 *                   type: string
 *                   example: John Doe
 *                 mobile_number:
 *                   type: integer
 *                   example: 1234567890
 *                 office_number:
 *                   type: integer
 *                   example: 0987654321
 *                 email_id:
 *                   type: string
 *                   format: email
 *                   example: john.doe@example.com
 *                 designation:
 *                   type: string
 *                   example: Manager
 *     responses:
 *       201:
 *         description: Contacts added successfully
 *       500:
 *         description: Failed to save contacts
 */

// Test route to check if POST is received
router.post('/', authenticateToken, async (req, res) => {
  const contacts = req.body;

  // Log parsed request body for debugging
  console.log('Received contacts data:', JSON.stringify(contacts, null, 2));

  try {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Invalid contact data provided' });
    }

    const savedContacts = await Promise.all(
      contacts.map(async (contact) => {
        return Contact.create({
          client_id: contact.client_id,
          contact_person: contact.contact_person,
          mobile_number: contact.mobile_number,
          office_number: contact.office_number,
          email_id: contact.email_id,
          designation: contact.designation,
          is_active: contact.is_active ?? true,
        });
      })
    );

    res.status(201).json({ message: 'Contacts added successfully', data: savedContacts });
  } catch (error) {
    console.error('Error saving contacts:', error);
    res.status(500).json({ error: 'Failed to save contacts' });
  }
});

/**
 * @swagger
 * /clientcontact/clients/{clientId}/contacts/{contactId}:
 *   put:
 *     summary: Update a specific contact of a client
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the client
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the contact to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact_person:
 *                 type: string
 *                 example: John Doe
 *               mobile_number:
 *                 type: string
 *                 example: "1234567890"
 *               office_number:
 *                 type: string
 *                 example: "0987654321"
 *               email_id:
 *                 type: string
 *                 example: john.doe@example.com
 *               designation:
 *                 type: string
 *                 example: Manager
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error on input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Validation error message
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.put('/clients/:clientId/contacts/:contactId', authenticateToken, async (req, res) => {
  const { clientId, contactId } = req.params;
  const { contact_person, mobile_number, office_number, email_id, designation } = req.body;

  try {
    const contact = await Contact.findOne({
      where: { id: contactId, client_id: clientId },
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update fields
    contact.contact_person = contact_person;
    contact.mobile_number = mobile_number;
    contact.office_number = office_number;
    contact.email_id = email_id;
    contact.designation = designation;

    // Save and handle validation error
    await contact.save();

    res.status(200).json({ message: 'Contact updated successfully', data: contact });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Log specific validation error details
      console.error('Validation Error:', error.errors.map(e => e.message));
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Error updating contact' });
  }
});
/**
 * @swagger
 * /clientcontact/clients/{clientId}/contacts/{contactId}/delete:
 *   put:
 *     summary: Toggle the active status of a specific contact of a client
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the client
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the contact to toggle active status
 *     responses:
 *       200:
 *         description: Contact active status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contact active status toggled successfully
 *                 contact:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.put('/clients/:clientId/contacts/:contactId/delete', authenticateToken, async (req, res) => {
  console.log("Attempting to toggle is_active status for contact");
  try {
      const { clientId, contactId } = req.params;

      // Find the contact by contactId and clientId
      const contact = await Contact.findOne({
          where: { id: contactId, client_id: clientId },
      });
      console.log("it is checking ###########################################", contact)

      if (!contact) {
          return res.status(404).json({ message: 'Contact not found' });
      }

      // Toggle the contact's `is_active` status
      const newStatus = contact.is_active ? false : true;
      console.log("Current status:", contact.is_active, "| New status to set:", newStatus);

      // Update the contact's `is_active` status directly
      const updatedContact = await contact.update({
          is_active: newStatus,
      });

      console.log("Updated contact status:", updatedContact.is_active);
      
      res.status(200).json({
          message: `Contact marked as ${updatedContact.is_active ? 'active' : 'inactive'} successfully`,
          contact: updatedContact,  // Return the updated contact object
      });
  } catch (error) {
      console.error('Error updating contact status:', error);
      res.status(500).json({
          message: 'Error updating contact status',
          error: error.message,
      });
  }
});



module.exports = router;
