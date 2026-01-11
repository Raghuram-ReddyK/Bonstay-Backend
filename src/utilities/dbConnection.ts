import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bonstay');
        console.log('MongoDB has been connected successfully...');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        if (err instanceof Error) {
            if (err.message.includes('ECONNREFUSED')) {
                console.error('Connection refused. Please ensure that MongoDB is running.');
            }
            else if (err.message.includes('IP')) {
                console.error('IP address issue. Please check your network settings or MongoDB Atlas IP whitelist.');
            }
        }
    }
};

export default connectDB;