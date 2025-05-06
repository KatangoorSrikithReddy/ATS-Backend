const XLSX = require('xlsx');
const { v4: uuidv4, validate: isUuid } = require('uuid');
const db = require("../models");
const { State } = db;

async function importStatesFromExcel() {
  try {
    const workbook = XLSX.readFile("C:\\Users\\manid\\Downloads\\sssssss.csv");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      const stateId = row.id && isUuid(row.id) ? row.id : uuidv4();
      const name = row.name?.trim();
      const countryId = row.country_id?.trim();

      if (!name || !countryId || !isUuid(countryId)) {
        console.warn('⛔ Skipping invalid row:', row);
        continue;
      }

      await State.findOrCreate({
        where: { id: stateId },
        defaults: { name, country_id: countryId }
      });
    }

    console.log('✅ States imported successfully!');
  } catch (err) {
    console.error('❌ Error importing states:', err);
  } finally {
    await db.sequelize.close();
  }
}

importStatesFromExcel();
