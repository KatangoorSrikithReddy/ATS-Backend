const XLSX = require('xlsx');
const { v4: uuidv4, validate: isUuid } = require('uuid');
const db = require("../models");
const { City } = db;

async function importCitiesFromExcel() {
  try {
    const workbook = XLSX.readFile("C:\\Users\\manid\\Downloads\\cities 2.csv");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      const cityId = row.id && isUuid(row.id) ? row.id : uuidv4();
      const name = row.name?.trim();
      const stateId = row.state_id?.trim();

      if (!name || !stateId || !isUuid(stateId)) {
        console.warn('⛔ Skipping invalid row:', row);
        continue;
      }

      await City.findOrCreate({
        where: { id: cityId },
        defaults: {
          name,
          state_id: stateId
        }
      });
    }

    console.log('✅ Cities imported successfully!');
  } catch (err) {
    console.error('❌ Error importing cities:', err);
  } finally {
    await db.sequelize.close();
  }
}

importCitiesFromExcel();
