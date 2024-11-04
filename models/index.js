const dbConfig = require("../config/db-config.js");

const {Sequelize, DataTypes} = require("sequelize");



const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
//   operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.js')(sequelize, Sequelize);
console.log("Is it working")
// db.Client = require('./clients.js')(sequelize, Sequelize);
db.JobRequest = require('./jobrequest.js')(sequelize, Sequelize);
db.ClientPage = require('./clientpage.js')(sequelize, Sequelize);
db.Contact = require('./clientcontact.js')(sequelize, Sequelize); // New Contact model

// db.Client.hasMany(db.JobRequest, {
//     foreignKey: "client_id",  // Explicitly set the foreign key to client_id
//     as: "job_requests"        // Alias for referencing associated job requests
//   });
//   db.JobRequest.belongsTo(db.Client, {
//     foreignKey: "client_id",  // Explicitly set the foreign key to client_id
//     as: "client"              // Alias for referencing the associated client
//   });




db.ClientPage.hasMany(db.Contact, {
foreignKey: "client_id",  // Explicitly set the foreign key to client_id
as: "contacts"            // Alias for referencing associated contacts
});
db.Contact.belongsTo(db.ClientPage, {
foreignKey: "client_id",  // Explicitly set the foreign key to client_id
as: "client"              // Alias for referencing the associated client
});
// ClientPage has many JobRequests
db.ClientPage.hasMany(db.JobRequest, {
  foreignKey: "client_id",  // Foreign key to link JobRequest with ClientPage
  as: "jobRequests"         // Alias for the associated job requests
});

// JobRequest belongs to one ClientPage
db.JobRequest.belongsTo(db.ClientPage, {
  foreignKey: "client_id",  // Foreign key to link JobRequest with ClientPage
  as: "client"              // Alias for the associated client (ClientPage)
});

module.exports = db;

db.sequelize.sync({ force: false }) // Only use force: true for development
.then(() => {
  console.log('Database & tables synced!');
})
.catch(error => {
  console.error('Error syncing database tables:', error);
});