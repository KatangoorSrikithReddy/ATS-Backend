const express = require("express");
const multer = require("multer");
const path = require("path");
const { ClientPageNew } = require("../models");
const fs = require("fs");
const router = express.Router();
const { minioClient, bucketName } = require("../config/minio");
console.log("Client Page New", ClientPageNew);



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
 *     description: Uploads a file and stores client information in the database.
 *     tags:
 *       - ClientPages
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client created successfully!"
 *                 client:
 *                   type: object
 *                   properties:
 *                     client_name:
 *                       type: string
 *                       example: "ABC Corp"
 *                     file:
 *                       type: string
 *                       example: "uploads/1709876543210-file.pdf"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
// router.post("/create", upload.single("upload"), async (req, res) => {
//     try {
//         const { client_name, contacts, email_id, address, country, state, city, postal_code,
//                 website, status, primary_owner, about_company, industry, category, created_by } = req.body;

//         const contactsJSON = JSON.parse(contacts);
//         const documentDetails = req.file
//             ? {
//                 file_name: req.file.originalname,
//                 file_type: req.file.mimetype,
//                 file_size: req.file.size,
//                 file_path: `uploads/${Date.now()}-${req.file.originalname}`,
//             }
//             : null;


//         const newClient = await ClientPageNew.create({
//             client_name,
//             contacts: contactsJSON,
//             email_id,
//             address,
//             country,
//             state,
//             city,
//             postal_code,
//             website,
//             status,
//             primary_owner,
//             about_company,
//             industry,
//             category,
//              document_details: documentDetails,
//             created_by,
//         });

//         res.json({ message: "Client created successfully!", client: newClient });
//     } catch (error) {
//         console.error("Error creating client:", error);
//         res.status(500).json({ error: "Server error" });
//     }
// });

router.post("/create", upload.single("upload"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        const { client_name, contacts, email_id, address, country, state, city, postal_code,
                            website, status, primary_owner, about_company, industry, category, created_by } = req.body;
            
        // ✅ Upload file to MinIO

        const contactsJSON = JSON.parse(contacts);
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
 *     summary: Update client details and optionally replace the uploaded file
 *     description: Update client details and upload a new file if provided. Old file is deleted if replaced.
 *     tags:
 *       - ClientPages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the client to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *                 example: "Updated Corp"
 *               contacts:
 *                 type: string
 *                 example: '[{"name": "John Doe", "phone": "9876543210"}]'
 *               email_id:
 *                 type: string
 *                 example: "updated@example.com"
 *               address:
 *                 type: string
 *                 example: "123 Updated Street"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 example: "California"
 *               city:
 *                 type: string
 *                 example: "Los Angeles"
 *               postal_code:
 *                 type: string
 *                 example: "90001"
 *               website:
 *                 type: string
 *                 example: "https://updatedcorp.com"
 *               status:
 *                 type: string
 *                 example: "Active"
 *               primary_owner:
 *                 type: string
 *                 example: "Jane Doe"
 *               about_company:
 *                 type: string
 *                 example: "We are an updated tech company."
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
 *                 format: binary  # File upload field
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client updated successfully!"
 *                 client:
 *                   type: object
 *                   properties:
 *                     client_name:
 *                       type: string
 *                       example: "Updated Corp"
 *                     document:
 *                       type: object
 *                       properties:
 *                         file_name:
 *                           type: string
 *                           example: "new-document.pdf"
 *                         file_type:
 *                           type: string
 *                           example: "application/pdf"
 *                         file_size:
 *                           type: integer
 *                           example: 204800
 *                         file_path:
 *                           type: string
 *                           example: "uploads/1709876543210-new-document.pdf"
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
// router.put("/update/:id", upload.single("upload"), async (req, res) => {
//     try {
//         const clientId = req.params.id;
//         const client = await ClientPageNew.findByPk(clientId);

//         if (!client) {
//             return res.status(404).json({ error: "Client not found" });
//         }

//         // ✅ Parse JSON Fields (Contacts)
//         const updatedContacts = req.body.contacts ? JSON.parse(req.body.contacts) : client.contacts;

//         // ✅ Prepare Updated Document Details
//         let documentDetails = client.document_details;
//         if (req.file) {
//             // ✅ Delete Old File (If Exists)
//             if (documentDetails && documentDetails.file_path) {
//                 const oldFilePath = path.join(__dirname, "../", documentDetails.file_path);
//                 if (fs.existsSync(oldFilePath)) {
//                     fs.unlinkSync(oldFilePath); // Delete old file
//                 }
//             }

//             // ✅ Save New File Details
//             documentDetails = {
//                 file_name: req.file.originalname,
//                 file_type: req.file.mimetype,
//                 file_size: req.file.size,
//                 file_path: `uploads/${Date.now()}-${req.file.originalname}`,
//             };
//         }

//         // ✅ Update Client Data in DB
//         await client.update({
//             client_name: req.body.client_name || client.client_name,
//             contacts: updatedContacts,
//             email_id: req.body.email_id || client.email_id,
//             address: req.body.address || client.address,
//             country: req.body.country || client.country,
//             state: req.body.state || client.state,
//             city: req.body.city || client.city,
//             postal_code: req.body.postal_code || client.postal_code,
//             website: req.body.website || client.website,
//             status: req.body.status || client.status,
//             primary_owner: req.body.primary_owner || client.primary_owner,
//             about_company: req.body.about_company || client.about_company,
//             industry: req.body.industry || client.industry,
//             category: req.body.category || client.category,
//             document_details: documentDetails,  // ✅ Updated File Details
//             created_by: req.body.created_by || client.created_by,
//         });

//         res.json({ message: "Client updated successfully!", client });

//     } catch (error) {
//         console.error("Error updating client:", error);
//         res.status(500).json({ error: "Server error" });
//     }
// });
router.put("/update/:id", upload.single("upload"), async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await ClientPageNew.findByPk(clientId);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        // ✅ Parse JSON Fields (Contacts)
        const updatedContacts = req.body.contacts ? JSON.parse(req.body.contacts) : client.contacts;

        let documentDetails = client.document_details;

        if (req.file) {
            // ✅ Delete Old File from MinIO (If Exists)
            if (documentDetails && documentDetails.file_name) {
                try {
                    await minioClient.removeObject(bucketName, documentDetails.file_name);
                    console.log(`✅ Deleted old file from MinIO: ${documentDetails.file_name}`);
                } catch (err) {
                    console.error("❌ Error deleting old file from MinIO:", err);
                }
            }

            // ✅ Upload New File to MinIO
            const fileName = `${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size, {
                "Content-Type": req.file.mimetype
            });

            // ✅ Generate File URL
            const fileUrl = `http://127.0.0.1:9000/${bucketName}/${fileName}`;

            documentDetails = {
                file_name: fileName,
                file_type: req.file.mimetype,
                file_size: req.file.size,
                file_url: fileUrl // Store MinIO file URL instead of local path
            };
        }

        // ✅ Update Client Data in DB
        await client.update({
            client_name: req.body.client_name || client.client_name,
            contacts: updatedContacts,
            email_id: req.body.email_id || client.email_id,
            address: req.body.address || client.address,
            country: req.body.country || client.country,
            state: req.body.state || client.state,
            city: req.body.city || client.city,
            postal_code: req.body.postal_code || client.postal_code,
            website: req.body.website || client.website,
            status: req.body.status || client.status,
            primary_owner: req.body.primary_owner || client.primary_owner,
            about_company: req.body.about_company || client.about_company,
            industry: req.body.industry || client.industry,
            category: req.body.category || client.category,
            document_details: documentDetails,  // ✅ Updated File Details
            created_by: req.body.created_by || client.created_by,
            document_details: documentDetails,  // ✅ Store MinIO File Info
        });

        res.json({ message: "Client updated successfully with MinIO!", client });

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
