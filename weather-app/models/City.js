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
    const findedCity = await CityModel.findOne({ nombre: cityName });
  
    if (!findedCity) 
    {
        return false;
    }
    return true;
};

async function showAllCities()
{
    const cities = await CityModel.find();
    const  pruebita = [];
    cities.forEach(city =>
        {
            pruebita.push({cod_mun : city.cod_mun, nombre : city.nombre});
        })
    return pruebita;
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


// Loads the municipios JSON file into database the first time you run the program 
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
// Checks in database if any city contains the provided string to find matches and suggest them to the user
async function getSuggestions(input) 
{
    const partialMatches = await CityModel.find({ nombre: { $regex: input, $options: 'i' } }).limit(10);
    const suggestedCities =  partialMatches.map((city) => city.nombre);
    return suggestedCities;
}


export { CityModel, findCityCodByName, cityIsInDatabase, loadCityData, getSuggestions, showAllCities }

// DUDA: habría que cargar las ciudades en la base de datos la primera vez 
// que se arranca en local? 
// Descomenta esto para añadir las ciudades a la base de datos la primera vez
//loadCityData('./data_city/municipios.json')