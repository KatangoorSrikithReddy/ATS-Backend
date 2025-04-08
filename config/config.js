// require("dotenv").config();  // ✅ Load .env variables

// module.exports = {
//   development: {
//     username: process.env.DB_USER || "root",
//     password: process.env.DB_PASS || "Chidhagni123",
//     database: process.env.DB_NAME || "node_db",
//     host: process.env.DB_HOST || "127.0.0.1",
//     dialect: "mysql"  // ✅ Explicitly set MySQL dialect
//   },
//   test: {
//     username: process.env.DB_USER || "root",
//     password: process.env.DB_PASS || "Chidhagni123",
//     database: process.env.DB_NAME_TEST || "node_db_test",
//     host: process.env.DB_HOST || "127.0.0.1",
//     dialect: "mysql"
//   },
//   production: {
//     username: process.env.DB_USER || "root",
//     password: process.env.DB_PASS || "Chidhagni123",
//     database: process.env.DB_NAME_PROD || "node_db_prod",
//     host: process.env.DB_HOST || "127.0.0.1",
//     dialect: "mysql"
//   }
// };



require("dotenv").config();  // ✅ Load .env variables

console.log("👉 Loaded DB_HOST:", process.env.DB_HOST);
console.log("🔍 Connecting to DB:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Chidhagni123",
    database: process.env.DB_NAME || "node_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Chidhagni123",
    database: process.env.DB_NAME || "node_db", // ✅ Same as development
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Chidhagni123",
    database: process.env.DB_NAME || "node_db", // ✅ Same as development
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  }
};

 