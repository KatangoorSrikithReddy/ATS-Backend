module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('individuals', 'reset_token', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('individuals', 'token_expiry', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },
  down: async (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('individuals', 'reset_token'),
      queryInterface.removeColumn('individuals', 'token_expiry'),
    ]);
  }
};
