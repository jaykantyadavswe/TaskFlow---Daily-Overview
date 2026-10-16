import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import DBConnect from './config/DBConnect.js';

dotenv.config();
await DBConnect(); // Wait for the database connection to be established

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});