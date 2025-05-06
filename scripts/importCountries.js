const XLSX = require('xlsx');
const { v4: uuidv4, validate: isUuid } = require('uuid');
const db = require("../models");
const { Country } = db;

// ✅ Use db.sequelize
async function importCountriesFromExcel() {
  try {
    // Use double backslashes or path string (or better: use path.join)
    const workbook = XLSX.readFile("C:\\Users\\manid\\Downloads\\cuntries.csv");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      const countryId = row.id && isUuid(row.id) ? row.id : uuidv4();
      const name = row.name?.trim();

      if (!name) {
        console.warn('Skipping row without name:', row);
        continue;
      }

      await Country.findOrCreate({
        where: { id: countryId },
        defaults: { name }
      });
    }

    console.log('✅ Countries imported successfully!');
  } catch (err) {
    console.error('❌ Error importing countries:', err);
  } finally {
    await db.sequelize.close(); // ✅ Use db.sequelize here
  }
}

importCountriesFromExcel();
