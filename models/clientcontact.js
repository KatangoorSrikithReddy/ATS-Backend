// module.exports = (sequelize, DataTypes) => {
//     const Contact = sequelize.define("Contact", {
//       contact_person: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       mobile_number: {
//         type: DataTypes.BIGINT, // Use BIGINT for large numbers like phone numbers
//         allowNull: false,
//       },
//       office_number: {
//         type: DataTypes.BIGINT, // Use BIGINT for large numbers like phone numbers
//         allowNull: false,
//       },
//       email_id: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         validate: {
//           isEmail: true,
//         },
//       },
//       designation: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       client_id: {
//         type: DataTypes.INTEGER,
//         references: {
//           model: 'ClientPage', // Name of the clients table
//           key: 'id',
//         },
//       },
//     });
  
//     return Contact;
//   };
  

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define("Contact", {
    contact_person: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.BIGINT, // Use BIGINT for large numbers like phone numbers
      allowNull: true,
    },
    office_number: {
      type: DataTypes.BIGINT, // Use BIGINT for large numbers like phone numbers
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ClientPage', // Name of the clients table
        key: 'id',
      },
    },
    // Adding is_active field
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default to active
    },
  });

  return Contact;
};
