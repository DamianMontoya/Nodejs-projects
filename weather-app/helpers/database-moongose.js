import mongoose from 'mongoose';
import { DATABASE_URI } from './env-parser.js';

const db = mongoose.connection;

const connectDB = async () =>
{
    try
    {
        await mongoose.connect(DATABASE_URI);
        console.log('DB connected...')
    }
    catch(error)
    {
    console.log(error);
    }
};

export {connectDB}
