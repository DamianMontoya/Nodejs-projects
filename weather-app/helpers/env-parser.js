import env from "dotenv";

const entorno = env.config({
path: `${process.cwd()}/.env`,
});
    
const { DATABASE_URI, AEMET_URL, AEMET_KEY } = entorno.parsed;

export { DATABASE_URI, AEMET_URL, AEMET_KEY}