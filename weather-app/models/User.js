import mongoose from 'mongoose';

// EL ESQUEMA DEL USUARIO
const userSchema = mongoose.Schema(
    {
        userName: 
        {
            type: String,
            required: [true, 'Please enter a user name']
        },
        password:
        {
            type: String,
            required: [true, 'Please enter a password']
        },
        email:
        {
            type: String,
            required: [true, 'Please enter an email'],
            unique: true,
            lowercase: true,
            validator: function (value) 
            {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Please enter a valid email address',
        },
        history:{
            type: Array,
            required:[false],
        }
    },
    {
        timeStamps: true,
    }
);

// EL MODELO DEL USUARIO
const UserModel = mongoose.model('User', userSchema);

async function createUser(newUserName, newPassword, newEmail)
{
    console.log('first')
    const user = new UserModel
    (
        {
            userName: newUserName,
            password: newPassword,
            email: newEmail,
            history: []
        }
    )
    console.log('connecting server...');



    console.log('connected server succesfuly...');

    await user.save();
    console.log('User saved succesfully...');
};

// RETORNA UN OBJETO DE USUARIO BUSCANDO POR EMAIL
async function findUserByEmail(UserEmail)
{
    try
    {
    const user = await UserModel.findOne({email : UserEmail});
    console.log('finded user is... ', user);
    return user;
    }
    catch(error)
    {
        console.log(error);
        return false;
    }
};
async function deleteUser ()
{
    UserModel.findOneAndDelete()
}


//RETORNA EL LISTADO DE TODOS LOS USUARIOS

async function findAllUsers()
{
    const userList = await UserModel.find();
    console.log('Loading the list of users...', userList);
    return userList;
};

// TE DEVULEVE LA INFO DEL USUARIO PARA CUANDO QUIERA CAMBIARLA
async function findUserInfo(userEmail)
{
    const {userName, password, email} = await findUserByEmail(userEmail);
    
    return {userName, password, email};
};

// ACTUALIZA LO QUE QUIERA

async function updateUserInfo()
{
    UserModel.findOneAndUpdate({})
} 

export { UserModel, createUser, findUserByEmail }


UserModel.findOneAndDelete({_email: 'da@da.com' })


/*

mongosh "mongodb+srv://User:User@cluster0.esavz0m.mongodb.net/Weather-app-DB?retryWrites=true&w=majority"

show dbs MUESTRA DBS
show collection MUESTRA COLECCIONES
db.${collection}.find() vuelca info
*/