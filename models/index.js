require("dotenv").config(); // ✅ Load .env variables

const {Sequelize, DataTypes} = require("sequelize");
const dbConfig = require("../config/config.js"); 


const sequelize = new Sequelize(
    dbConfig.development.database,
    dbConfig.development.username,
    dbConfig.development.password,
    {
      host: dbConfig.development.host,
      dialect: dbConfig.development.dialect,
      logging: false, // Optional: Prevents console logs from Sequelize
    }
  );

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.js')(sequelize, Sequelize);
console.log("Is it working")
// db.Client = require('./clients.js')(sequelize, Sequelize);
db.JobRequest = require('./jobrequest.js')(sequelize, Sequelize);
db.ClientPage = require('./clientpage.js')(sequelize, Sequelize);
db.Contact = require('./clientcontact.js')(sequelize, Sequelize); // New Contact model
db.Roles = require('./roles.js')(sequelize, Sequelize);
db.Individuals = require('./individuals.js')(sequelize, Sequelize);
db.LevelHierarchy = require('./levelhierarchy.js')(sequelize, Sequelize);

db.UserRoles = require("./individualandroles.js")(sequelize, DataTypes);
db.Applicants = require("./applicants.js")(sequelize, DataTypes);
// ✅ Individual belongs to Role through UserRoles
db.Individuals.belongsToMany(db.Roles, { 
  through: db.UserRoles, 
  foreignKey: "user_id", 
  as: "roles" 
});

// ✅ Role belongs to many Individuals through UserRoles
db.Roles.belongsToMany(db.Individuals, { 
  through: db.UserRoles, 
  foreignKey: "role_id", 
  as: "users" 
});

// ✅ UserRoles Table: Establish the many-to-one mapping
db.UserRoles.belongsTo(db.Individuals, { foreignKey: "user_id", as: "user" });
db.UserRoles.belongsTo(db.Roles, { foreignKey: "role_id", as: "role" });



db.Roles.belongsTo(db.Roles, { foreignKey: "parent_role_id", as: "ParentRole" });
db.Roles.hasMany(db.Roles, { foreignKey: "parent_role_id", as: "ChildRoles" });



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