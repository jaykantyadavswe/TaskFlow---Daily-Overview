import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import DBConnect from './config/DBConnect.js';
import taskRoutes from './routes/task.routes.js';

dotenv.config();
await DBConnect(); // Wait for the database connection to be established

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'TaskFlow API is running!' });
});
app.use('/api/tasks', taskRoutes);


app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});