import http from 'https'
import {AEMET_KEY}  from './helpers/env-parser.js'
import axios from 'axios'
import {findCityCodByName, cityIsInDatabase}  from './models/City.js'
import inquirer from 'inquirer';
import chalk from 'chalk';
import { insertHistoryDB } from './models/User.js';
import { userMainMenuHandler } from  './user_v3.js';



// PREGUNTA AL USUARIO LA CIUDAD, DEVUELVE EL NOMBRE DE LA CIUDAD
async function askCity ()
{
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
  const cityExists = await cityIsInDatabase(input);
  return cityExists;
}

// Entre la funcion de arriba y la de abajo viene la llamada al CityModel 
// para extrar del nombre de la ciudad de arriba el codigo municipio para pasarlo abajo


// pasandole el cod municipio te devuelve la URL con la info del tiempo
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

// funcion que hace peticion a la URL de la prediccion, devuelve data extraida en obj
async function getWeather (url)
{
    try
    {
        const response = await axios.get(url);

        const weatherData = [];
        console.clear();
        console.log(chalk.green(`The weather in ${response.data[0].nombre} this week:`));

        const predicction = response.data[0].prediccion;
        predicction.dia.forEach((dia) => 
        {
            // al ser un campo que a veces no rellenan si es = '' que diga que no hay data.
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
// Esta funcion es enorme y abarca demasiado, hay que refactorizar
async function getData(currentUser)
{
    const municipioNombre = await askCity();

    //HECHO CON LA VALIDACION DE ARRIBA, NO PUEDE PASAR UNA CITY QUE NO EXISTA EN LA BD => falta validacion, si no se encuentra el COD en BD devuelva null y retorne a askCity()
    const municipioCod = await findCityCodByName(municipioNombre);

    //falta validacion, si el status es !200 promesa reject(null) y retorne askCity 
    const responseDataURL = await getApiUrlResponse(municipioCod);
    if(responseDataURL === null)
    {
        console.log(chalk.red('Error during the request proces...'));
        await userMainMenuHandler('weather') 
    }

    //aqui no debiera petar, da OK si he configurado el manejo de la response de la URL de arriba
    const weatherData = await getWeather(responseDataURL);
    if(weatherData.length === 0)
    {
      console.log('Internet crashed... Did you pay last bill?');
      await userMainMenuHandler('weather') 
    }
    //crear el objeto para luego insertarlo en la BD, habria que manejar que llegue aqui si arriba todo OK
    const historyData = { city: municipioNombre, weather: weatherData, date: new Date()};
    await insertHistoryDB(currentUser, historyData);

    return weatherData;
};

async function logWeather(weatherData)
{
    weatherData.forEach(info =>
      {
          console.log(`Day: ${info.day}
                       Max temperature: ${info.maxTemperature}ºC
                       Min temperature: ${info.minTemperature}ºC
                       Humidity: ${info.humidity}%
                       Sky descriptione: ${info.skyDescription}}
                      `)
      });
};
export {getData, askCity, getApiUrlResponse, getWeather, logWeather }

/* esta maneja toda la logica paso por paso:
    - pregunta por ciudad y retorna el nombre
    - query al CityModel pasandole el nombre, devuelve codigo municipio
    - se pasa el cod a responseDataURL que devuelve una URL con la prediccion
    - se hace la peticion a la URL de arriba y devuelve un objeto con la info basica
    - inserta la busqueda en el historial

  promise.all => array promises resueltas.
*/