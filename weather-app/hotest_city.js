import {showAllCities} from './models/City.js'
import http from 'http';
import { connectDB } from './helpers/database-moongose.js';
import {AEMET_KEY}  from './helpers/env-parser.js'
import axios from 'axios';

async function getApiUrlResponse(codMunicipio) 
{
    return new Promise((resolve, reject) => {
      const apiURL = `prediccion/especifica/municipio/diaria/${codMunicipio}`;
      const options = 
      {
        method: "GET",
        hostname: "opendata.aemet.es",
        path: `/opendata/api/${apiURL}/?api_key=${AEMET_KEY}`,
        headers: {
          "cache-control": "no-cache",
        },
      };
      const req = http.request(options, function (res) {
        if (res.statusCode !== 200) {
          console.log('Error during the request. Status Code:', res.statusCode);
          reject(new Error(`Error during the request. Status Code: ${res.statusCode}`));
        }
        const chunks = [];
        let body;
  
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
  
        res.on("end", async function () {
          body = Buffer.concat(chunks);

  
          try {
            const { datos } = JSON.parse(body);
            resolve(datos);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            reject(new Error('Error parsing JSON'));
          }
        });
      });
  
      // Handle errors during the HTTP request
      req.on('error', (error) => {
        console.error('Error during the request:', error);
        reject(new Error('Error during the request'));
      });
  
      req.end();
    });
  }
  

async function getWeather (url)
{
    try
    {
        const response = await axios.get(url);

        const weatherData = [];


        const prediccion = response.data[0].prediccion;
        prediccion.dia.forEach((dia) => 
        {
            const basicInfo = 
            {
                day: dia.fecha.slice(8, 10),
                maxTemperature: dia.temperatura.maxima,
                minTemperature: dia.temperatura.minima,
            };

            weatherData.push(basicInfo);

        });
        return weatherData;
    } 
    catch(error)
    {
        console.log('Internet conection failed during the request...');
        return [];
    }
};



async function cruzaLosDedos() {
  try {
    await connectDB();

    const cities = await showAllCities();
    console.log(cities[0])
    const cityWeatherDataPromises = cities.map(async (city) => {
      const { cod_mun, nombre } = city;
      const response = await getApiUrlResponse(cod_mun);
      const data = await getWeather(response);

      return { city: nombre, weatherData: data };
    });

    // Use Promise.all to await all the promises concurrently
    const cityWeatherData = await Promise.all(cityWeatherDataPromises);

    return cityWeatherData;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  
// this next func was done by GPT 
async function compareTemperatures() {
    try {
      await connectDB();
      const cityWeatherData = await cruzaLosDedos();
  
      // Compare temperatures to find the hottest and coldest city
      let hottestCity = null;
      let coldestCity = null;
  
      for (const cityData of cityWeatherData) {
        for (const weatherInfo of cityData.weatherData) {
          if (!hottestCity || weatherInfo.maxTemperature > hottestCity.maxTemperature) {
            hottestCity = { city: cityData.city, ...weatherInfo };
          }
  
          if (!coldestCity || weatherInfo.minTemperature < coldestCity.minTemperature) {
            coldestCity = { city: cityData.city, ...weatherInfo };
          }
        }
      }
  
      return [hottestCity, coldestCity];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  // Call the function to compare temperatures
//const masFriasMasCalientes = await compareTemperatures();
//console.log(masFriasMasCalientes)

const prueba = await cruzaLosDedos()
