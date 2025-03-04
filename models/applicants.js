const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Applicant = sequelize.define("Applicant", {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,  // Generates a new UUID
      primaryKey: true
    },
    applicant_id: {
        type: DataTypes.STRING, // Change to INTEGER
        allowNull: false,
        unique: true
    },
    applicant_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { timestamps: true });

  return Applicant;
};
