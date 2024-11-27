import express, { Request, Response } from 'express';
import dbClient from './db/connection';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import jwt from 'jsonwebtoken';
import { Server as io } from 'socket.io';
import messages from './messages';

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
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const websockets = new io(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:9990'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 30000,
});

messages(websockets);
