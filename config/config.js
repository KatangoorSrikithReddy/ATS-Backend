require("dotenv").config();  // ✅ Load .env variables

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Chidhagni123",
    database: process.env.DB_NAME || "node_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"  // ✅ Explicitly set MySQL dialect
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Chidhagni123",
    database: process.env.DB_NAME_TEST || "node_db_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Chidhagni123",
    database: process.env.DB_NAME_PROD || "node_db_prod",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  }
};
