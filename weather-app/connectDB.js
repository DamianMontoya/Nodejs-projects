import mongoose from 'mongoose';
import env from "dotenv";
env.config({
    path: `${process.cwd()}/.env`,
  });

const { DATABASE_URI } = process.env;


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
}

connectDB();