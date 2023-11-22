import mongoose from 'mongoose';
import { showUserMainMenu, goPreviousMenu } from '../user_v3.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

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
        timestamps: true,
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
// RETORNA UN TRUE SI EMAIL REGISTRADO, FALSE DE LO CONTRARIO 
async function userEmailIsRegisred(UserEmail)
{
    try
    {
    const user = await UserModel.findOne({email : UserEmail});
    return user !== null ? true : false;
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
    await UserModel.findOneAndUpdate(id, {email: newEmail});
};

async function updateUserName(id, newUserName)
{
    await UserModel.findOneAndUpdate(id, {userName: newUserName});
};

async function updateUserPassword(id, newPassword)
{
    await UserModel.findOneAndUpdate(id, {password: newPassword});
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
};

async function deleteAllUsers()
{
    try
    {
        await UserModel.deleteMany({});
    }
    catch(error)
    {
        console.log('Error deleting all users..-', error)
    }
};

async function insertHistoryDB(currentUser, newHistoryInsert)
{
    try
    {
        //console.log('CURRENT USER INSDE INSERT HISTORY DB', currentUser);
        //console.log('NEW HISTORY ABOUT TO BE PUSHED', newHistoryInsert)

        if(currentUser.history.length <= 9)
        {
            const porFavorFunciona = await UserModel.updateOne({ _id: currentUser._id }, { $push: { history: { $position: 0, newHistoryInsert } } })
            //console.log(porFavorFunciona);
        }
        else
        { 
            //check history array indexes, 1 the last and -1 the first
            //pushear la busqueda al primer index
            await UserModel.updateOne({ _id: currentUser._id }, { $push: { history: { $each: [newHistoryInsert], $position: 0 } } });
            //eliminar la data del ultimo index
             await UserModel.updateOne({ _id: currentUser._id }, { $pop: {history: 1} })
        }
    }
    catch(error)
    {
        console.log('Error during the insert of the new search into history', error);
    }
};

async function userSearchHistory(currentUser) 
{
    try 
    {
        const {history} = await UserModel.findById(currentUser._id);
        if(history.length === 0)
        {
            console.log(chalk.red('No searches done yet'));
            await goPreviousMenu();
        }
        displayUserHistory(history)
    }
    catch (error) 
    {
        console.log('Error getting user search history:', error);
        await showUserMainMenu();
    }
};

// COMPROBAR PORQUE DA LA ULTIMA UNDEFINED
async function displayUserSearchHistory(history)
{
    history.forEach((search, index = 1  )=>
        {
            console.log
            (`  ${index}- Date of search: ${search.date} 
                City searched: ${search.city}
            `)
        })
        await selectHistory(history)
};


async function selectHistorySearchIndex(history)
{
    const {selectedSearchIndex} = await inquirer.prompt([
    {
        type: 'input',
        name: 'choice',
        message: 'Chose the index of the search to see the weather',
        validate: function(input)
        {
            if(input < 0 && input >= currentUser.history.length)
            {
                console.log(chalk.red('You must enter the number of one of the searches'));
                return false;
            }
            return true;
        }
    }])
    return selectedSearchIndex;
};
async function logSelectedSearchHistory(selectedSearchIndex)
{    const { selectedWeather } = history[choice].weather;
    console.log(selectedWeather)
    console.log(chalk.green(history[choice].weather));
    await goPreviousMenu();
}
/*
async function selectHistory(data)
{
    const {choice} = inquirer.prompt([
        type: 'list',
        name: 'selectHistory',
        
    ])
};
*/
export { UserModel, createUser, findUserByEmail, updateUserEmail, updateUserName, findUserById, updateUserPassword, deleteUser, userEmailIsRegisred, insertHistoryDB, userSearchHistory }



/*
MONGODB ATLAS PARA GESTION DE BD GRAFICA
mongosh "mongodb+srv://User:User@cluster0.esavz0m.mongodb.net/Weather-app-DB?retryWrites=true&w=majority"
show dbs MUESTRA DBS
show collection MUESTRA COLECCIONES
db.${collection}.find() vuelca info

https://stackoverflow.com/questions/8866041/how-can-i-list-all-collections-in-the-mongodb-shell
*/