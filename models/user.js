module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      hashedPassword: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      googleSub: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(255),
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      workStatus: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      totalExperience: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentSalary: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: '₹',
      },
      salaryBreakdown: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fixedSalary: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      variableSalary: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      currentLocation: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'Australia',
      },
      availability: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fixedSalaryCurrency: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: '₹',
      },
      variableSalaryCurrency: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: '₹',
      },
    }, {
      tableName: 'users',
    });
  
    return User;
  };
  