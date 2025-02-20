module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Roles", "parent_role_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "Roles",  // Self-referencing to the same table
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Roles", "parent_role_id");
  }
};
