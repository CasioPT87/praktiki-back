import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
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
import { Server as io } from 'socket.io';
import { authorization } from './utils/auth';
import messages from './messages';

import routes from './routes';
import { GlobalLocationChatsManager } from './services/locationChat/manager';

// Initialize environment variables
dotenv.config();

const app = express();
const port = 3022;

// Setup Middleware
app.use(
  cors({
    origin: `https://localhost:8080`,
    credentials: true,
  })
); // Enable Cross-Origin Resource Sharing

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

app.use(authorization);

app.use('/', routes);

// Start the server
const key = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');
const server = https.createServer({ key, cert }, app);
//const server = http.createServer(app);

server.listen(port);

server.on('listening', () => {
  console.log(
    `Server is running and listening at ${port} on ${process.env.NODE_ENV}`
  );
});

const websockets = new io(server, {
  cors: {
    origin: `https://localhost:8080`,
    // [
    //   'https://localhost',
    //   process.env.NETWORK || '',
    //   'http://localhost:8080',
    //   'http://localhost:9990',
    // ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 30000,
});

messages(websockets);

global.io = websockets;

GlobalLocationChatsManager.addAllLocationChats();
