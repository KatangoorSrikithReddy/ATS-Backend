'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ClientPage', 'client_visibility', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('ClientPage', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('ClientPage', 'feral_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('ClientPage', 'created_by', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ClientPage', 'client_visibility');
    await queryInterface.removeColumn('ClientPage', 'category');
    await queryInterface.removeColumn('ClientPage', 'feral_id');
    await queryInterface.removeColumn('ClientPage', 'created_by');
  }
};
