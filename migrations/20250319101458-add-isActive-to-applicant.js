module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Applicants', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,  // Default value is true (active)
    });
  }
};
