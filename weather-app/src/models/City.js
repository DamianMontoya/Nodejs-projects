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

// returns true if a given city name is in database, false otherwise
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


// Loads the municipios JSON file into database the first time you run the program 
async function loadCityData(path) 
{
    const count = await CityModel.countDocuments();
    if(count > 0)
    {
        console.log('Data is already loaded');
        return;
    }

    console.log('Loading city data into database...')
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
