import { City } from "../models/City"
const listCitys = (req, res) =>
{
    City.find()
}


async function getCityIdByName(nombre) {
    const city = await City.findOne({ nombre: nombre });
  
    if (!city) 
    {
        console.log('No city finded...')
        return null;
    }
  
    return city._id;
};