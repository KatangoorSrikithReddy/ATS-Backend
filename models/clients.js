const { HasMany } = require("sequelize");

// models/clients.js
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      client_name: DataTypes.STRING,
      contacts_number: DataTypes.STRING,
      email_id: DataTypes.STRING,
      website: DataTypes.STRING,
      industry: DataTypes.STRING,
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      business_unit: DataTypes.STRING,
      category: DataTypes.STRING,
      postal: DataTypes.STRING,
      created_by: DataTypes.STRING,
      created_on: DataTypes.DATE,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'clients', // Ensure this matches the database table
    });
  
    // Define associations
  

    
  
    return Client;
  };
  