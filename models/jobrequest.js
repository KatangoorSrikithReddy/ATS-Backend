// models/jobrequest.js
module.exports = (sequelize, DataTypes) => {
    const JobRequest = sequelize.define('JobRequest', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ClientPageNew', // This should match the 'clients' table in the database
          key: 'id',
        },
      },
      job_title: DataTypes.STRING,
      job_location: DataTypes.STRING,
      pay_range: DataTypes.STRING,
      work_mode_type: DataTypes.STRING,
      job_type: DataTypes.STRING,
      status: DataTypes.STRING,
      primary_skills: DataTypes.STRING,
      immediate_joining: DataTypes.STRING,
      description: DataTypes.STRING,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'job_requests', // Ensure this matches the database table name
    });

  
    
    return JobRequest;
  };
  