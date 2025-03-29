

const { v4: uuidv4 } = require("uuid");
const State=require("./states")

module.exports = (sequelize, DataTypes) => {


  const City = sequelize.define("City", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generates a new UUID
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "State",
        key: "id"
      }
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
  }, { timestamps: true , tableName : 'cities'});

  // Define Associations
  // City.belongsTo(State, { foreignKey: "state_id", onDelete: "CASCADE" });
  // State.hasMany(City, { foreignKey: "state_id", onDelete: "CASCADE" });

  return City;
};
