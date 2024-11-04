'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Contacts', 'mobile_number', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
    await queryInterface.changeColumn('Contacts', 'office_number', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Contacts', 'mobile_number', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.changeColumn('Contacts', 'office_number', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },
};
