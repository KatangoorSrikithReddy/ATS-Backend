// models/City.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const State = require('./State');

class City extends Model {}
City.init({
  name: DataTypes.STRING,
  state_id: DataTypes.INTEGER,
}, {
  sequelize,
  modelName: 'City',
});

City.belongsTo(State, { foreignKey: 'state_id' });

module.exports = City;
