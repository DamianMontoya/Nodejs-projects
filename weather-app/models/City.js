import mongoose from 'mongoose';

const {Schema} = mongoose;

const citySchema = new Schema(
    {
        id: { type: Number, required: true},
        nombre : { type: String, required: true}
    }, 
    {
        timestamps: true
    }
);

const CityModel = mongoose.model('City', citySchema);

export { CityModel }