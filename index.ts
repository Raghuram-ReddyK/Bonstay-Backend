import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnection from './src/utilities/dbConnection';
import userRoutes from './src/routes/userRoutes';
import adminCodeRoutes from './src/routes/adminCodeRoutes';
import hotelRoutes from './src/routes/hotelRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
    { origin: '*' }
));
app.use(express.json());

// Connect to Database
dbConnection();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin-codes', adminCodeRoutes);
app.use('/api/hotels', hotelRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Bonstay Backend!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
});