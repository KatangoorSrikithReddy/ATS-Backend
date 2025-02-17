module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create UserRoles Table if not exists
    await queryInterface.createTable("UserRoles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Individuals",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the UserRoles table if rollback is needed
    await queryInterface.dropTable("UserRoles");
  }
};
