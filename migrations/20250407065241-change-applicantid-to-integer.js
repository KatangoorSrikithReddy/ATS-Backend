'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('applicants', 'applicant_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('applicants', 'applicant_id', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  }
};
