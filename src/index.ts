import express, { Request, Response } from 'express';

const app = express();
const port = 3022;

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!!!!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});