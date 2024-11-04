// models/State.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../ci');
const Country = require('./Country');

class State extends Model {}
State.init({
  name: DataTypes.STRING,
  country_id: DataTypes.INTEGER,
}, {
  sequelize,
  modelName: 'State',
});

State.belongsTo(Country, { foreignKey: 'country_id' });

module.exports = State;
