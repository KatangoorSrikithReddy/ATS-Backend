module.exports = (sequelize, Sequelize) => {
    const Individual = sequelize.define('Individual', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4, // Auto-generate UUID
            primaryKey: true,
        },
        username: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true, // Validate email format
            },
        },
        password: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        first_name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        mobile_number: {
            type: Sequelize.STRING(15),
            allowNull: true,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Default is active
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updated_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        created_by: {
            type: Sequelize.UUID,
            allowNull: true,
        },
        updated_by: {
            type: Sequelize.UUID,
            allowNull: true,
        },
        deleted_at: {
            type: Sequelize.DATE,
            allowNull: true, // Soft delete feature
        }
    }, {
        tableName: 'individuals', // ✅ Set custom table name
        timestamps: false, // Disables default timestamps (we have custom ones)
        paranoid: true, // Enables soft deletion by tracking deleted_at field
    });

    return Individual;
};
