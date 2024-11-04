module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "T#9758@qlph",
    DB: "node_db",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

// module.exports = {
//     development: {
//       username: "root",
//       password: "T#9758@qlph",
//       database: "node_db",
//       host: "localhost",
//       dialect: "mysql",
//       pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//       }
//     }
//   };
  