import http from 'https'
import {AEMET_KEY}  from './helpers/env-parser.js'
import axios from 'axios'
import {findCityCodByName, cityIsInDatabase, getSuggestions}  from './models/City.js'
import inquirer from 'inquirer';
import chalk from 'chalk';
import { insertHistoryDB } from './models/User.js';
import { userMainMenuHandler } from  './user_v3.js';



// Ask city to the user and returns it 
async function askCity ()
{
    console.clear();
    const {city} = await inquirer.prompt
    ({
        type: 'input', 
        name: 'city', 
        message: chalk.yellow('Enter the city to know the weather: '),
        validate: checkCityExistsDatabase
    });

    return city;
};

async function checkCityExistsDatabase(input)
{   
    if(input.match(/[0-9]/g))
    {   
        console.clear();
        console.log(chalk.red('\nA city cant numbers in its name'));
        return false;
    }
    const cityExists = await cityIsInDatabase(input);

    if(!cityExists)
    {
        console.clear();
        console.log(chalk.blue('No city finded, maybe you mean one of the following?\n'));
        const citySuggestions = await getSuggestions(input);
        console.log('\n')
        citySuggestions.forEach(City =>
            {
                console.log(City);
            })
        return false;
    }
    return true;
}

// returns the URL of the weather of a given city ID
async function getApiUrlResponse (codMunicipio)
{
    return new Promise((resolve, reject) =>
    {
        const apiURL = `prediccion/especifica/municipio/diaria/${codMunicipio}`;
        const options = 
        {
            method: "GET",
            hostname: "opendata.aemet.es",
            path: `/opendata/api/${apiURL}/?api_key=${AEMET_KEY}`,
            headers: 
            {
              "cache-control": "no-cache"
            }
        };
      
    const req = http.request(options, function (res) 
    {
        if(res.statusCode !== 200)
        {
          console.log('Error during the request...');
          reject(null);
        }
        const chunks = [];
        let body

        res.on("data", function (chunk) 
        {
            chunks.push(chunk);
        });

        res.on("end", async function () 
        {
            body = Buffer.concat(chunks);

            const {datos} = JSON.parse(body);
            resolve(datos);
        });
    });

    req.end();

    });
};

// Req of a 
async function getWeather (url)
{
    try
    {
        const response = await axios.get(url);

        const weatherData = [];
        console.clear();

        console.log('\n\n\n\n\n\n\n\n')
        console.log(chalk.green(`The weather in ${response.data[0].nombre} this week:`));

        const predicction = response.data[0].prediccion;
        predicction.dia.forEach((dia) => 
        {
            // AEMET does not always return the descripcion field so this handles it
            if(dia.estadoCielo[0].descripcion === '')
            {
              dia.estadoCielo[0].descripcion = 'For the moment there is no clear data';
            }
            const basicInfo = 
            {
                day: dia.fecha.slice(8, 10),
                maxTemperature: dia.temperatura.maxima,
                minTemperature: dia.temperatura.minima,
                humidity: dia.humedadRelativa.maxima,
                skyDescription: dia.estadoCielo[0].descripcion,
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
// Has the logic of everything related to weather, from asking the city to returning the weather 
async function getData(currentUser)
{
    // Gets city name
    const municipioNombre = await askCity();

    // Gets city ID of a given city name
    const municipioCod = await findCityCodByName(municipioNombre);

    // Gets URL with weather data of a given city ID
    const responseDataURL = await getApiUrlResponse(municipioCod);
    if(responseDataURL === null)
    {
        console.log(chalk.red('Error during the request proces...'));
        await userMainMenuHandler('weather') 
    }

    // Stores the weather and handles conection issues
    const weatherData = await getWeather(responseDataURL);
    if(weatherData.length === 0)
    {
      console.log('Internet crashed... Did you pay last bill?');
      await userMainMenuHandler('weather') 
    }
    // Inserts the data into database
    const historyData = { city: municipioNombre, weather: weatherData, date: new Date().toLocaleString()};
    await insertHistoryDB(currentUser, historyData);

    return weatherData;
};
// Easy way of displaying weather data in prompt
async function logWeather(weatherData)
{
    weatherData.forEach(info =>
      {
          console.log(`
                               Day: ${info.day}\n
                       Max temperature: ${info.maxTemperature}ºC
                       Min temperature: ${info.minTemperature}ºC
                       Humidity: ${info.humidity}%
                       Sky descriptione: ${info.skyDescription}
                      `)
      });
};

export {getData, askCity, getApiUrlResponse, getWeather, logWeather,checkCityExistsDatabase }

/* esta maneja toda la logica paso por paso:
    - pregunta por ciudad y retorna el nombre
    - query al CityModel pasandole el nombre, devuelve codigo municipio
    - se pasa el cod a responseDataURL que devuelve una URL con la prediccion
    - se hace la peticion a la URL de arriba y devuelve un objeto con la info basica
    - inserta la busqueda en el historial

  promise.all => array promises resueltas.
*/