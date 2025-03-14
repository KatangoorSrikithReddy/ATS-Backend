module.exports = (sequelize, DataTypes) => {
    const ClientPage = sequelize.define('ClientPageNew', {
        client_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contacts: {  // ✅ Store contact details as JSON
            type: DataTypes.JSON,
            allowNull: false,
        },
        email_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        contacts_number: {  // ✅ Single Contact Number (No Validation)
            type: DataTypes.STRING,
            allowNull: true,  // Can be nullable
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postal_code: {
            type: DataTypes.STRING(6),
            allowNull: false,
            
        },
        website: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        primary_owner: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        about_company: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        industry: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        client_visibility: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Organization',
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        document_details: { // ✅ JSON Column to Store File Info
            type: DataTypes.JSON, // Stores file name, type, and size as JSON
            allowNull: true,
        },
        fedral_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
        tableName: 'ClientPageNew',
    });

    return ClientPage;
};
