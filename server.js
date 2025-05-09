// Import modules
const colors = require('colors');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const authRouter = require('./routers/auth.routers');
const clientRouter = require('./routers/client.routers')
const app = express(); // Create an express app
const jobRequestRoutes = require('./routers/jobrequest.routers')
const clientpageRoutes = require('./routers/clientpage.routers')
const contactRouter = require('./routers/clientcontats.routers');
const rolesRouter = require('./routers/roles.routers');
const IndividualRouter = require('./routers/individuals.routers');
const IndividualandRoles = require('./routers/individualsroles.routers');
const LevelHierarchies = require('./routers/level.routers');
const ResetPassword = require("./routers/reset.routers")
const Applicant = require('./routers/applicant.routers')
const ClientPageNew = require('./routers/clientnew.routers')
const locationRoutes = require('./routers/location.routers');
const industryRoutes = require('./routers/industries.routers');

// Load environment variables
require('dotenv').config();

// Environment configuration
const ENV = process.env.NODE_ENV || 'development';
const allowedOrigin = process.env.CORS_ORIGIN;
const HOST = process.env.HOST || 'localhost';

// Set port based on environment
const PORT = ENV === 'beta' ? 8094 : ENV === 'production' ? 8095 : 8080;

// Environment-specific logging
console.log('\n=== Environment Configuration ==='.cyan);
console.log(`Environment: ${ENV.toUpperCase()}`.yellow);
console.log(`Port: ${PORT}`.yellow);
console.log(`Host: ${HOST}`.yellow);
console.log(`CORS Origin: ${allowedOrigin}`.yellow);
console.log('===============================\n'.cyan);

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: [allowedOrigin],
  credentials: true,
}));

// Request logging
app.use(morgan('dev'));

// API Routes
app.use('/auth', authRouter);
app.use('/job-requests', jobRequestRoutes);
app.use('/roles', rolesRouter);
app.use('/individuals', IndividualRouter);
app.use("/individualsRoles", IndividualandRoles);
app.use('/levelhierarchies', LevelHierarchies);
app.use('/api', ResetPassword);
app.use('/applicants', Applicant);
app.use('/client', ClientPageNew);
app.use('/api', locationRoutes);
app.use('/industry', industryRoutes);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'ATS API Documentation',
      version: '1.0.0',
      description: `API documentation for ATS Application (${ENV.toUpperCase()} Environment)`,
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}`,
        description: `${ENV.toUpperCase()} Server`
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routers/*.js'],
};

// Initialize Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('\n=== Server Status ==='.green);
  console.log(`Server is running in ${ENV.toUpperCase()} mode`.green);
  console.log(`API URL: http://${HOST}:${PORT}`.green);
  console.log(`Swagger UI: http://${HOST}:${PORT}/docs`.green);
  console.log('====================\n'.green);
});
