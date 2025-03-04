const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { Applicants } = require("../models");// Ensure this is correctly referencing the model
const db = require("../models");

console.log("this is applicant", Applicants)
async function importExcelData(filePath, userId) {
    try {
        await db.sequelize.authenticate(); // Ensure DB is connected
        console.log("✅ Database connection successful!");

        // Read Excel File
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("🔍 Extracted Data from Excel:", excelData.slice(0, 5)); // Debug first 5 rows

        if (!excelData.length) {
            console.error("❌ Excel file is empty or headers do not match!");
            return;
        }

        console.log(`🚀 Processing ${excelData.length} records...`);

        for (let row of excelData) {
            console.log("Processing Row:", row); // Debug each row

            // **Ensure the correct column names are used**
            let applicantId = row["Applicant ID"];
            let applicantName = row["Applicant Name"];
            let mobileNumber = row["Mobile Number"];
            let emailAddress = row["Email Address"];

            // **Ensure applicant_id is correctly formatted as an INTEGER**
            if (Array.isArray(applicantId)) {
                console.error(`⚠️ Invalid applicant_id format (Array found): ${applicantId}`);
                continue;
            }
            if (typeof applicantId === "string") {
                applicantId = parseInt(applicantId.trim(), 10); // Convert to integer
            }
            if (isNaN(applicantId)) {
                console.error(`⚠️ Invalid applicant_id value: ${applicantId}`);
                continue;
            }

            if (!applicantId || !applicantName || !mobileNumber || !emailAddress) {
                console.error(`⚠️ Skipping row due to missing data: ${JSON.stringify(row)}`);
                continue; // Skip the row
            }

            // **Check if the applicant already exists (avoid duplicate entries)**
            const existingApplicant = await Applicants.findOne({
                where: { email_address: emailAddress }
            });

            if (!existingApplicant) {
                await Applicants.create({
                    id: uuidv4(), // Generates new UUID for primary key
                    applicant_id: applicantId, // Ensure it's an integer now
                    applicant_name: applicantName,
                    mobile_number: mobileNumber,
                    email_address: emailAddress,
                    created_by: userId,
                    updated_by: userId
                });
                console.log(`✅ Inserted: ${applicantName} (${emailAddress})`);
            } else {
                console.log(`⚠️ Skipping duplicate: ${emailAddress}`);
            }
        }

        console.log("🎉 Data Import Successful!");
    } catch (error) {
        console.error("❌ Error importing data:", error.message);
        console.error("Stack trace:", error.stack);
    } finally {
        if (db.sequelize) {
            await db.sequelize.close();
            console.log("✅ Database connection closed.");
        }
    }
}

// Run Import
importExcelData("C:\\Users\\manid\\Downloads\\Sample_Applicants_Data.xlsx", "srikith ");