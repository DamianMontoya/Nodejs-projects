//// WEATHER

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
    
    const city = userInput.city.toLowerCase().trim();

    return city;
};

async function getCoordinates (city)
{
    const apiKey = 'MY APIKEY'
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${apiKey}&limit=1`;

    try 
    {
        const response = await axios.get(geoUrl);
        const coordinates = 
        {
            // the response is object with features property that is a array of objects, 
            //in the 0 index the "center property contains the location in array form [longitude,latitude]
            longitude: response.data.features[0].center[0],
            latitude: response.data.features[0].center[1],
        };
        console.log('getting coordenates of the city...');

        return coordinates;
    }
    catch(error)
    {
        console.log(error);
    }
};

async function getWeather(coordinates)
{
    const apiKey = 'MY APIKEY';
    //const city = await askCity();
    //const cordinates = await getCoordinates(city);
    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cordinates.latitude}&lon=${cordinates.longitude}&appid=${apiKey}`;

    try 
    {
        const response = await axios.get(openWeatherUrl);
        console.log('getting the weather of the city...');
        
        return response.data;
    } 
    catch (error) 
    {
        throw new Error("Error fetching weather data from Open Weather");
    }
};


async function displayData()
{
    const city = await askCity();
    const coordinates = await getCoordinates(city);
    const data = await getWeather(coordinates);

    console.log(data);

    await inquirer.prompt
    ({
        type: 'input',
        name: 'pressEnter',
        message: 'Press enter to go to the menu',
    })
    showUserMainMenu();
};
