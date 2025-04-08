module.exports = (sequelize, DataTypes) => {
    const UserRoles = sequelize.define("UserRoles", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "individuals",  // ✅ Reference to the Users/Individuals Table
                key: "id"
            },
            onDelete: "CASCADE"
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Roles",  // ✅ Reference to the Roles Table
                key: "id"
            },
            onDelete: "CASCADE"
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
            allowNull: true, // ✅ Stores the ID of the creator (admin assigning the role)
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,  // ✅ Stores the ID of the user who last updated the role assignment
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
    }, {
        timestamps: false,
        tableName: "userroles"
    });

    return UserRoles;
};
