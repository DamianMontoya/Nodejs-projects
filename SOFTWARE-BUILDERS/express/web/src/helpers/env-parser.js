const env = require ('dotenv');

const enviroment = env.config({
path: `${process.cwd()}/.env`,
});
    
const { DATABASE_URI } = enviroment.parsed;

module.exports = { DATABASE_URI }