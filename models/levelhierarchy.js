module.exports = (sequelize, DataTypes) => {
    const LevelHierarchy = sequelize.define("LevelHierarchy", { 
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
        parent_role_id: { // 👈 Self-referencing foreign key for hierarchy
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "LevelHierarchy",  // ✅ Fix table name (previously 'LevelHierarchies')
                key: "id"
            }
        },
        level: {
            type: DataTypes.STRING(10), // ✅ Add level field (Alphanumeric)
            allowNull: false
        },
        can_create: {
            type: DataTypes.JSON, // ✅ Stores which levels this role can create
            allowNull: false,
            defaultValue: '[]' // ✅ Empty JSON array by default
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
        tableName: "levelhierarchy" // ✅ Enforce explicit table name
    });

    // ✅ Define Self-referencing Relationship for Parent Role
    LevelHierarchy.belongsTo(LevelHierarchy, {
        foreignKey: "parent_role_id",
        as: "ParentRole", // ✅ Alias for fetching parent role details
        onDelete: "SET NULL", // ✅ If parent is deleted, child roles remain
        onUpdate: "CASCADE"
    });

    // ✅ Define Reverse Relationship (A Role can have multiple children)
    LevelHierarchy.hasMany(LevelHierarchy, {
        foreignKey: "parent_role_id",
        as: "ChildRoles",
        constraints: false
    });

    return LevelHierarchy;
};
