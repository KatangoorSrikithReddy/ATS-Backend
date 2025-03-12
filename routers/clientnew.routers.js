const express = require("express");
const multer = require("multer");
const path = require("path");
const { ClientPageNew } = require("../models");
const fs = require("fs");
const router = express.Router();
const { minioClient, bucketName } = require("../config/minio");
console.log("Client Page New", ClientPageNew);

const { v4: uuidv4 } = require("uuid");


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Ensure this folder exists
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

const upload = multer({ storage: multer.memoryStorage() });
/**
 * @swagger
 * /client/create:
 *   post:
 *     summary: Upload a file and create a client record
 *     description: Uploads a file to MinIO and stores client information in the database.
 *     tags:
 *       - ClientPages
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - client_name
 *               - email_id
 *               - upload
 *             properties:
 *               client_name:
 *                 type: string
 *                 example: "ABC Corp"
 *               contacts:
 *                 type: string
 *                 description: JSON string for contact details
 *                 example: '[{"name": "John Doe", "phone": "1234567890"}]'
 *               email_id:
 *                 type: string
 *                 format: email
 *                 example: "abc@example.com"
 *               address:
 *                 type: string
 *                 example: "123 Street, NY"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 example: "New York"
 *               city:
 *                 type: string
 *                 example: "NYC"
 *               postal_code:
 *                 type: string
 *                 example: "10001"
 *               website:
 *                 type: string
 *                 example: "https://abc.com"
 *               status:
 *                 type: string
 *                 example: "Active"
 *               primary_owner:
 *                 type: string
 *                 example: "John Doe"
 *               about_company:
 *                 type: string
 *                 example: "We are a tech company."
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *               category:
 *                 type: string
 *                 example: "Enterprise"
 *               created_by:
 *                 type: string
 *                 example: "Admin"
 *               upload:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully!"
 *                 client:
 *                   type: object
 *                   properties:
 *                     client_name:
 *                       type: string
 *                       example: "ABC Corp"
 *                     document_details:
 *                       type: object
 *                       properties:
 *                         file_name:
 *                           type: string
 *                           example: "document.pdf"
 *                         file_url:
 *                           type: string
 *                           example: "http://127.0.0.1:9000/client-files/document.pdf"
 *       400:
 *         description: Bad request (Missing file or required fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File is required"
 *       500:
 *         description: Server error
 */
router.post("/create", upload.single("upload"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        const { client_name, contacts, email_id, address, country, state, city, postal_code,
            website, status, primary_owner, about_company, industry, category, created_by } = req.body;
            
        // ✅ Parse contacts JSON and ensure each contact has a UUID
        let contactsJSON = [];

if (contacts) {
    try {
        if (typeof contacts === "string") {
            console.log("📌 Received contacts as a string:", contacts);
            contactsJSON = JSON.parse(contacts); // ✅ Parse only if it's a string
        } else if (Array.isArray(contacts)) {
            console.log("📌 Received contacts as an array:", contacts);
            contactsJSON = contacts; // ✅ Already an array, use as is
        } else {
            return res.status(400).json({ error: "Contacts must be a valid JSON array" });
        }

        // ✅ Ensure each contact has a UUID
        contactsJSON = contactsJSON.map(contact => ({
            id: contact.id || uuidv4(),
            name: contact.contactname,
            mobilenumber: contact.mobilenumber,
            officenumber: contact.officenumber,
            email: contact.email || null ,
            designation : contact.designation || null // Handle optional designation
        }));

    } catch (error) {
        console.error("❌ Invalid contacts JSON:", error);
        return res.status(400).json({ error: "Invalid contacts JSON format" });
    }
}


        // ✅ Upload file to MinIO
        const fileName = `${Date.now()}-${req.file.originalname}`;
        await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size, {
            "Content-Type": req.file.mimetype
        });

        // ✅ Generate File URL
        const fileUrl = `http://127.0.0.1:9000/${bucketName}/${fileName}`;

        // ✅ Store file details in the database
        const newClient = await ClientPageNew.create({
            client_name,
            contacts: contactsJSON,
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
            document_details: {
                file_name: req.file.originalname,
                file_type: req.file.mimetype,
                file_size: req.file.size,
                file_url: fileUrl,
            },
            created_by,
        });

        res.json({ message: "File uploaded successfully!", client: newClient });

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Server error" });
    }
});




/**
 * @swagger
 * /client/list:
 *   get:
 *     summary: Get all client records
 *     description: Retrieve a list of all clients along with uploaded document metadata.
 *     tags:
 *       - ClientPages
 *     responses:
 *       200:
 *         description: Successfully retrieved all client details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       client_name:
 *                         type: string
 *                         example: "ABC Corp"
 *                       email_id:
 *                         type: string
 *                         example: "abc@example.com"
 *                       document:
 *                         type: object
 *                         properties:
 *                           file_name:
 *                             type: string
 *                             example: "document.pdf"
 *                           file_type:
 *                             type: string
 *                             example: "application/pdf"
 *                           file_size:
 *                             type: integer
 *                             example: 123456
 *                           file_path:
 *                             type: string
 *                             example: "uploads/1709876543210-document.pdf"
 *       500:
 *         description: Server error
 */
router.get("/list", async (req, res) => {
    try {
        // ✅ Fetch all clients from the database
        const clients = await ClientPageNew.findAll();

        // ✅ Format the response with document details
        const clientList = clients.map(client => ({
            client_name: client.client_name,
            contacts: client.contacts ,
            email_id: client.email_id,
            address: client.address,
            country: client.country,
            state: client.state,
            city: client.city,
            postal_code: client.postal_code,
            website: client.website,
            status: client.status,
            primary_owner: client.primary_owner,
            about_company: client.about_company,
            industry: client.industry,
            category: client.category,
            created_by: client.created_by,
            document: client.document_details || "No document uploaded",
            isactive: client.is_active,
        
        }));

        res.json({ clients: clientList });

    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Server error" });
    }
});



// const path = require("path");
// const express = require("express");
// const { ClientPageNew } = require("../models");
// const upload = require("../middlewares/upload");

// const router = express.Router();


/**
 * @swagger
 * /client/update/{id}:
 *   put:
 *     summary: Update client contacts and details
 *     description: Accepts an array of contacts and updates the client's details.
 *     tags:
 *       - ClientPages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client to update
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
 *                   example: "John Doe"
 *                 mobile_number:
 *                   type: integer
 *                   example: 1234567890
 *                 office_number:
 *                   type: integer
 *                   example: 987654321
 *                 email_id:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 designation:
 *                   type: string
 *                   example: "Manager"
 *     responses:
 *       200:
 *         description: Client contacts updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client contacts updated successfully!"
 *       400:
 *         description: Bad request (Invalid JSON format)
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */

router.put("/update/:id", upload.single("upload"), async (req, res) => {
    try {
        console.log("this is req.body", req.params.id)
        const clientId = req.params.id;
        const client = await ClientPageNew.findByPk(clientId);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        // ✅ Extract Data
        const {
            client_name,
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
            created_by,
            isactive,
            contacts
        } = req.body;

        console.log("this is request body", req.body)
        // body = JSON.parse(req.body.contacts);

        console.log("********************")
        console.log("Contacts:", req.body.contacts);


        // ✅ Handle Contacts Update
        let updatedContacts = client.contacts || []; // Keep existing contacts if none provided
        if (req.body.contacts) {
            try {
                let newContacts = req.body.contacts;
                
                // ✅ Ensure each contact has a UUID
                updatedContacts = newContacts.map(contact => ({
                    id: contact.id || uuidv4(), // Keep existing ID or assign a new one
                    name: contact.name,
                    email: contact.email || null,
                    phone: contact.phone
                }));


                console.log("this is contacts list", updatedContacts)
            } catch (error) {
                return res.status(400).json({ error: "Invalid contacts JSON format" });
            }
        }

        // ✅ Handle File Update in MinIO
        let documentDetails = client.document || {}; // Keep old document if no new file is uploaded
        if (req.file) {
            // ✅ Delete Old File from MinIO
            if (documentDetails?.file_url) {
                const oldFileName = documentDetails.file_url.split("/").pop();
                await minioClient.removeObject(bucketName, oldFileName);
            }
            
            // ✅ Upload New File
            const fileName = `${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size, {
                "Content-Type": req.file.mimetype
            });

            // ✅ Generate File URL
            const fileUrl = `http://127.0.0.1:9000/${bucketName}/${fileName}`;

            documentDetails = {
                file_name: req.file.originalname,
                file_type: req.file.mimetype,
                file_size: req.file.size,
                file_url: fileUrl
            };
        }

        // ✅ Update Client Data in DB
        await client.update({
            client_name: client_name || client.client_name,
            contacts: updatedContacts,
            email_id: email_id || client.email_id,
            address: address || client.address,
            country: country || client.country,
            state: state || client.state,
            city: city || client.city,
            postal_code: postal_code || client.postal_code,
            website: website || client.website,
            status: status || client.status,
            primary_owner: primary_owner || client.primary_owner,
            about_company: about_company || client.about_company,
            industry: industry || client.industry,
            category: category || client.category,
            created_by: created_by || client.created_by,
            isactive: isactive !== undefined ? isactive : client.isactive, // Update isactive flag
            document: documentDetails // ✅ Update document
        });

        res.json({ message: "Client updated successfully!", client });

    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * @swagger
 * /client/delete/{id}:
 *   delete:
 *     summary: Soft delete a client (Set is_active to false)
 *     description: Marks the client as inactive instead of deleting the record.
 *     tags:
 *       - ClientPages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the client to soft delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client soft deleted successfully!"
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: Server error
 */
router.delete("/delete/:id", async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await ClientPageNew.findByPk(clientId);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        // ✅ SOFT DELETE: Set `is_active` to false
        await client.update({ is_active: false });

        res.json({ message: "Client soft deleted successfully!" });

    } catch (error) {
        console.error("Error in soft delete:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
