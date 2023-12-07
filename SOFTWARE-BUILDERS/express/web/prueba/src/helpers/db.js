const mongoose = require('mongoose');
const { DATABASE_URI } = require('./env-parser.js');

const db = mongoose.connection;

const connectDB = async () =>
{
    try
    {
        await mongoose.connect(DATABASE_URI);
        console.log('DB connected succesfully');
    }
    catch(error)
    {
        console.log(error);
    }
};

module.exports = { connectDB }