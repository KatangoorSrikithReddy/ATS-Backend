module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define("Roles", { 
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        role_name: { 
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        level_name: { // ✅ Store level name instead of FK
            type: DataTypes.STRING(50),
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,  // ✅ Set default value to true
            allowNull: false
        },
        parent_role_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "Roles",  // ✅ Self-reference to Roles table
                key: "id"
            },
            onDelete: "CASCADE", // Optional: Delete child roles if parent is deleted
            onUpdate: "CASCADE"
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true
        },
        permissions: { // ✅ Store permissions as JSON
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        timestamps: false,
        tableName: "Roles" // ✅ Explicit table name
    });

    return Roles;
};
