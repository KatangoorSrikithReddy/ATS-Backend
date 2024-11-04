// models/Country.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Country extends Model {}
Country.init({
  name: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Country',
});

module.exports = Country;

