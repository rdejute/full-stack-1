/* *********************
 * THIRD-PARTY LIBRARIES
 ***********************/
import mongoose from 'mongoose';

/* *************************
 * ENVIRONMENT CONFIGURATION
 ***************************/
import dotenv from 'dotenv';
dotenv.config();

/* *******************
 * DATABASE CONNECTION
 *********************/
const openMongoConnection = async () => {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log("connected to MongoDB");
    });
    await mongoose.connect(process.env.MONGODB_URI);
};

/* ********************
 * DATABASE DISCONNECTION
 **********************/
const closeMongoConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error;
    }
};

/* **********************
 * MONGOOSE CONFIGURATION
 ************************/
mongoose.set('strictQuery', true)

/* *******
 * EXPORTS
 *********/
export default { 
    openMongoConnection,
    closeMongoConnection 
};