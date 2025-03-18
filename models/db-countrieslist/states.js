// const { DataTypes } = require("sequelize");
// const sequelize = require("../db");
// const Country = require("./countries");

module.exports = (sequelize, DataTypes) => {
const State = sequelize.define("State", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Countries",
      key: "id",
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
  }
}, { timestamps: true });

return State;
};