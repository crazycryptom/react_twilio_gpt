import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app';
// import { syncFineTune } from './controllers/agent.controller';


// Connect DB
const dbUrl = process.env.NODE_ENV === 'development' ? process.env.DATABASE_URL : 'mongodb://localhost:27017/';

const port = process.env.PORT || 5000;

const server = app.listen(port, async () => {
    
    console.log(`Server is running on Port ${port}`);
    try {
        // await syncFineTune();
        await mongoose.connect(
            dbUrl as string,
        );
        console.log("🛢️  Connected To Database")
    } catch (error) {
        console.log("⚠️ Error to connect Database");
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
})