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

const path = require('path');
const dotenv = require('dotenv');

// Determine the environment; default to 'development' if not set
const env = process.env.NODE_ENV || 'development';

// Construct the path to the appropriate .env file
const envPath = path.resolve(__dirname, `../.env.${env}`);

// Load environment variables from the specified file
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw result.error;
}


console.log(`Environment: ${env}`);
console.log(`Database Host: ${process.env.CORS_ORIGIN}`);
console.log("👉 Loaded DB_HOST:", process.env.HOST);
console.log("🔍 Connecting to DB:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

module.exports = {
  development: {
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME, 
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT ,
    dialect: "mysql"
  },
  beta: {
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME ,
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT ,
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

 