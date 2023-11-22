import mongoose from 'mongoose';
//import municipios from '../data_city/municipios.json' assert { type : 'json'};
import fs from 'fs';

const {Schema} = mongoose;

const citySchema = new Schema(
    {
        cod_mun: { type: Number, required: true},
        nombre : { type: String, required: true}
    }, 
    {
        timestamps: true
    }
);

const CityModel = mongoose.model('City', citySchema);

async function findCityCodByName(cityName)
{
    try
    {
        const city = await CityModel.findOne({nombre: cityName});
        return city.cod_mun;
    }
    catch(error)
    {
        console.log(error);
    }
};

// otra manera mas simple de encontrar el id por nombre
async function cityIsInDatabase(cityName) 
{
    const city = await CityModel.findOne({ nombre: cityName });
  
    if (!city) 
    {
        console.log('\nNo city finded...')
        return false;
    }
    return true;
};

async function showAllCities()
{
    const cities = CityModel.find()
    //console.log(cities);
};

async function insertCitiesDB (path)
{
    try
    {
        const cityData = fs.readFileSync(path);
        const siudades =JSON.parse(cityData)
        await CityModel.insertMany(siudades)
        console.log('FETEEEEEEEEEEEEEEEEN AL FIN')
    }
    catch(error)
    {
        console.log('PETARDAZOOOOOOOOOOO',error);
    }
};


// VUELCA EL JSON EN LA DB, FALTABA CONECTAR LA BASE DE DATOS LMAOOOOOOOOOOOOOOO
async function loadCityData(path) 
{
    console.log('LETS GO')
    let cityData = fs.readFileSync(path);  
    let cities = JSON.parse(cityData);  

    try 
    {
        await CityModel.insertMany(cities, { timeout: 3000 });
        console.log('Data loaded maestro');
    } 
    catch (error) 
    {
        console.error('Error loading data:', error);
    }
};

export { CityModel, findCityCodByName, cityIsInDatabase, loadCityData }

// DUDA: habría que cargar las ciudades en la base de datos la primera vez 
// que se arranca en local? 
// Descomenta esto para añadir las ciudades a la base de datos la primera vez
//loadCityData('./data_city/municipios.json')