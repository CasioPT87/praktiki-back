import express, { Request, Response } from 'express';
import dbClient from './db/connection';
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
import routes from './routes';

// Initialize environment variables
dotenv.config();

const app = express();
const port = 3022;

// Setup Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Set security headers
app.use(compression()); // Enable response compression
app.use(cookieParser()); // Parse cookies
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// Swagger setup for API documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API',
      version: '1.0.0',
      description: 'API Documentation for Express app',
    },
  },
  apis: ['./index.js'], // Path to the API docs, can add more files here
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('*', routes);

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!!!!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
