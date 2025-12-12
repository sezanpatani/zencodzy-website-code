import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error('❌ MONGODB_URI is not defined in .env file');
            // Don't exit process in dev, just warn
            return null;
        }

        const conn = await mongoose.connect(uri, {
            // Mongoose 6+ defaults are good, excessive options removed
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        return null;
    }
};

export default connectDB;
