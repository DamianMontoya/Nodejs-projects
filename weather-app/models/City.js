import mongoose from 'mongoose';

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
        const {cod_mun} = await CityModel.findOne({nombre: cityName});
        return cod_mun;
    }
    catch(error)
    {
        console.log(error);
    }
};


export { CityModel }