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
    const user = new UserModel
    (
        {
            userName: newUserName,
            password: newPassword,
            email: newEmail,
            history: []
        }
    )
    await user.save();
};

// RETORNA UN OBJETO DE USUARIO BUSCANDO POR EMAIL
async function findUserByEmail(UserEmail)
{
    try
    {
    const user = await UserModel.findOne({email : UserEmail});
    //console.log('finded user is... ', user);
    return user;
    }
    catch(error)
    {
        console.log(error);
        return false;
    }
};

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

async function updateUserEmail(id, newEmail)
{
    console.log('updaeting email...')
    await UserModel.findOneAndUpdate(id, {email: newEmail});
    console.log('updated email succesfully...')
};

async function updateUserName(id, newUserName)
{
    console.log('updating userName...');
    await UserModel.findOneAndUpdate(id, {userName: newUserName});
    console.log('updated userName succesfully...');
};

async function updateUserPassword(id, newPassword)
{
    await UserModel.findOneAndUpdate(id, {password: newPassword});
    console.log('updated password...')
};

async function findUserById(id)
{
    try
    {
    const user = await UserModel.findById(id);
    return user;
    }
    catch(error)
    {
        console.log(error);
    }
};

async function deleteUser(id)
{
    await UserModel.findByIdAndDelete(id);
}
export { UserModel, createUser, findUserByEmail, updateUserEmail, updateUserName, findUserById, updateUserPassword, deleteUser }

//UserModel.findOneAndDelete({_email: 'da@da.com' })


/*

mongosh "mongodb+srv://User:User@cluster0.esavz0m.mongodb.net/Weather-app-DB?retryWrites=true&w=majority"

show dbs MUESTRA DBS
show collection MUESTRA COLECCIONES
db.${collection}.find() vuelca info
*/