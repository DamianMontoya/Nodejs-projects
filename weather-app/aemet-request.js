import http from 'https'
import {AEMET_KEY}  from './helpers/env-parser.js'
import axios from 'axios'

// PREGUNTA AL USUARIO LA CIUDAD, DEVUELVE EL NOMBRE DE LA CIUDAD
async function askCity ()
{
    const userInput = await inquirer.prompt
    ({
        type: 'input', 
        name: 'city', 
        message: chalk.yellow('Enter the city to know the weather: '),
        validate(city)
        {
            if(!city)
            {
                console.log('You must enter a city');
            }
            return true;
        }
    });
    
    const city = userInput.city;
    console.log(city);
    return city;
};

// Entre la funcion de arriba y la de abajo viene la llamada al CityModel 
// para extrar del nombre de la ciudad de arriba el codigo municipio para pasarlo abajo


// pasandole el cod municipio te devuelve la URL con la info del tiempo
async function getApiUrlResponse (codMunicipio)
{
    return new Promise((resolve) =>
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
    
            // Print the content directly
            // O QUE RETORNE LA variable
            console.log(`
              day: ${basicInfo.day},
              maxTemperature: ${basicInfo.maxTemperature},
              minTemperature: ${basicInfo.minTemperature},
              humidity: ${basicInfo.humidity},
              skyDescription: ${basicInfo.skyDescription}
           `);
           weatherData.push(basicInfo);
        });
        return weatherData;
    } 
    catch(error)
    {
        console.log(error);
    }
};

/* esta maneja toda la logica paso por paso:
    - pregunta por ciudad y retorna el nombre
    - query al CityModel pasandole el nombre, devuelve codigo municipio
    - se pasa el cod a responseDataURL que devuelve una URL con la prediccion
    - se hace la peticion a la URL de arriba y devuelve un objeto con la info basica

    FALTA CONECTAR LA OPCION WEATHER DEL MAIN MENU CON LA FUNCION ASKCITY Y QUE CONCATENE TODO. 
    CON TODO ESTO Y QUE CUADRE
*/
async function mun (){ return '01001'}; // <= Mockeo de la llamada a la basde de datos por no estar todavia creada

// funcion que retorna el tiempito
async function getData()
{
    const municipioNombre = await askCity();
    const municipioCod = await mun();
    //const municipioCod = getCityIdByName(municipioNombre);
    const responseDataURL = await getApiUrlResponse(municipioCod);
    const responseWeather = await getWeather(responseDataURL);

    return responseWeather;
};


getData();