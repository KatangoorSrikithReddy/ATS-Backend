module.exports = (sequelize, DataTypes) => {
    const ClientPage = sequelize.define('ClientPage', {
      client_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contacts_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [10, 10], // Ensure contact number is exactly 10 digits
        },
      },
      email_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true, // Validate email format
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [6, 6], // Ensure postal code is exactly 6 digits
        },
      },
      website: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      primary_owner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about_company: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN, // Ensure the correct data type is used
        defaultValue: true,      // Set default to `true` if needed
      },
      // New Fields
      client_visibility: {
        type: DataTypes.STRING, // Change to STRING to accept "Organization", "Business Unit", etc.
        allowNull: false,
        defaultValue: 'Organization', // Default to a string, e.g., "Organization"
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false, // You can modify this based on your use case
      },
      fedral_id: {
        type: DataTypes.STRING,
        allowNull: true, // Allow this to be optional unless required
      },
      created_by: {
        type: DataTypes.STRING, // Store the name of the creator (firstName + lastName)
        allowNull: false,       // Ensure it is mandatory
      },
    }, {
      timestamps: true, // Add createdAt and updatedAt timestamps
      tableName: 'ClientPage',
    });
    
    return ClientPage;
  };
  