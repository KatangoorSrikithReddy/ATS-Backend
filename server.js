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
const IndividualandRoles =   require('./routers/individualsroles.routers');
const LevelHierarchies = require('./routers/level.routers');
const ResetPassword  = require("./routers/reset.routers")

const Applicant = require('./routers/applicant.routers')
const ClientPageNew = require('./routers/clientnew.routers')
const locationRoutes = require('./routers/location.routers');
const industryRoutes = require('./routers/industries.routers');

require('dotenv').config();

const allowedOrigin = process.env.CORS_ORIGIN;
const HOST = process.env.DB_HOST;
const ENV = process.env.NODE_ENV || 'development';

// Set port based on environment
const PORT = ENV === 'beta' ? 8094 : ENV === 'production' ? 8095 : 8080;

console.log(`Environment: ${ENV}`);
console.log('Allowed Origin:', allowedOrigin);
console.log('Host:', HOST);
console.log('Port:', PORT);

// Middleware to log requests  
console.log('Allowed Origin:', allowedOrigin); // Log the allowed origin for debugging

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  // origin: ['http://localhost', 'http://69.62.72.239'], // React frontend URL
  origin: [allowedOrigin], // React frontend URL
 
  credentials: true,
}));
 
// Use Morgan to log requests
app.use(morgan('dev')); // 'dev' format gives you concise colored output
app.use('/auth', authRouter);

// app.use('/clients', clientRouter);
app.use('/job-requests', jobRequestRoutes);
// app.use('/client-page', clientpageRoutes )

// app.use('/clientcontact', contactRouter);
app.use('/roles', rolesRouter)
app.use('/individuals', IndividualRouter )
app.use("/individualsRoles", IndividualandRoles)
app.use('/levelhierarchies', LevelHierarchies)

app.use('/api', ResetPassword)

app.use('/applicants', Applicant)

app.use('/client', ClientPageNew)
app.use('/api', locationRoutes)
app.use('/industry', industryRoutes)















// Swagger options
// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: "3.0.0", // Specify the version of OpenAPI
//     info: {
//       title: "Tutorial API", // Title of the API
//       version: "1.0.0", // Version of the API
//       description: "API documentation for the Tutorial application", // Description
//     },
//     servers: [
//       {
//         url: "http://localhost:8080/", // Updated server URL
//       },
//     ],
//   },
//   apis: ['./routers/*.js'], // Update path to match your route files if they are located in the `routers` directory
// };

  
// module.exports = swaggerOptions;
  

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'ClientPage API',
        version: '1.0.0',
        description: 'API documentation for managing client pages',
      },
      servers: [
        {
          url: 'http://localhost:8080',
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
    apis: ['./routers/*.js'], // Ensure that your file path is correct
  };

  
  


// Initialize Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger docs

// Start the server on the appropriate port
app.listen(PORT, () => {
  console.log(`Server is running in ${ENV} mode on http://${HOST}:${PORT}`.blue);
  console.log(`Swagger UI is available at http://${HOST}:${PORT}/docs`.yellow);
});

// console.log(`Server is running on http://${HOST}:${PORT}`.blue);
// console.log(`Swagger UI is available at http://${HOST}:${PORT}/docs`.yellow);
