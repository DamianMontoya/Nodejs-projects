import mongoose from 'mongoose';
import { showUserMainMenu, goBack } from '../app_logic.js';
import { logWeather } from '../aemet-request.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import bcrypt from 'bcrypt';

// user schema
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

// User Model
const UserModel = mongoose.model('User', userSchema);

async function createUser(newUserName, newPassword, newEmail)
{
    const cryptedPassword = await bcrypt.hash(newPassword,10);
    const user = new UserModel
    (
        {
            userName: newUserName,
            password: cryptedPassword,
            email: newEmail,
            history: []
        }
    )
    await user.save();
};

// returns a object of user if the given email is database
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
// returns true if email is registered, false if not
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

// returns all the docs of users if needed
async function findAllUsers()
{
    const userList = await UserModel.find({});
    console.log('Loading the list of users...',);
    return userList;
};

// given the the user email it returns its userName, password and email
async function findUserInfo(userEmail)
{
    const {userName, password, email} = await findUserByEmail(userEmail);
    
    return {userName, password, email};
};

// updates the email 
async function updateUserEmail(id, newEmail)
{
    await UserModel.findOneAndUpdate(id, {email: newEmail});
};

// updates the userName
async function updateUserName(id, newUserName)
{
    await UserModel.findOneAndUpdate(id, {userName: newUserName});
};

// updates the password
async function updateUserPassword(id, newPassword)
{
    const cryptedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate(id, {password: cryptedPassword});
};

// finds in database by ID and returns the user as object
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

// deletes the user
async function deleteUser(id)
{
    await UserModel.findByIdAndDelete(id);
};

// deletes all users if needed
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

// inserts in user history database the new search of a user
async function insertHistoryDB(currentUser, newHistoryInsert)
{
    try
    {
        if(currentUser.history.length <= 9)
        {
            await UserModel.updateOne({ _id: currentUser._id }, { $push: { history: { $each: [newHistoryInsert], $position: 0 } } });
        }
        else
        { 
            // insert data into first index
            await UserModel.updateOne({ _id: currentUser._id }, { $push: { history: { $each: [newHistoryInsert], $position: 0 } } });
            // erase last index data
             await UserModel.updateOne({ _id: currentUser._id }, { $pop: {history: 1} })
        }
    }
    catch(error)
    {
        console.log('Error during the insert of the new search into history', error);
    }
};

// returns the history search of a given User
async function userSearchHistory(currentUser) 
{
    try 
    {
        const {history} = await UserModel.findById(currentUser._id);
        if(history.length === 0)
        {
            console.clear();
            console.log(chalk.red('No searches done yet'));
            return null;
        }

        return history;
    }
    catch (error) 
    {
        console.log('Error getting user search history:', error);
        await showUserMainMenu();
    }
};

// displays the city and date of the user history search
async function displayUserSearchHistory(history)
{

    history.forEach((search, index)=>
        {
            console.log
            (`  
                ${index+1}- Date of search: ${search.date} 
                   City searched: ${search.city}
            `)
        })
};

// user selects the index of the history search and returns it
async function selectHistorySearchIndex(history)
{
    const { selectedSearchIndex } = await inquirer.prompt([
    {
        type: 'input',
        name: 'selectedSearchIndex',
        message: chalk.yellow('Chose the index of the search to see the weather: '),
        validate: function(input)
        {
            if(input <= 0 || input > history.length || isNaN(input))
            {
                console.log(chalk.red('\nYou must enter the index number of one of the searches'));
                return false;
            }
            return true;
        }
    }])
    return selectedSearchIndex -1;
};
// displays the selected history search 
async function logSelectedSearchHistory(completeHistorySearch, selectedSearchIndex)
{   
    const  selectedWeather  = completeHistorySearch[selectedSearchIndex].weather;
    await logWeather(selectedWeather);
}

async function showSearchHistoryLogic(currentUser)
{
    try
    {
        // checkear si no hay historial => devulve al menu, de lo contrario almacena historial
        const completeHistorySearch = await userSearchHistory(currentUser);
        if(completeHistorySearch === null)
        {
            return;
        }

        //Muestra el historial completo por  pantalla
        await displayUserSearchHistory(completeHistorySearch);

        // el usuario escoge que index de historial desea visualizar
        const chosenHistorySearch = await selectHistorySearchIndex(completeHistorySearch);

        // muestra por pantalla el tiempo del historial escogido
        await logSelectedSearchHistory(completeHistorySearch, chosenHistorySearch);

    }
    catch(error)
    {
        console.log('Error getting history data...', error)
    }
}

export { UserModel, createUser, findUserByEmail, updateUserEmail, updateUserName, findUserById, updateUserPassword, deleteUser, userEmailIsRegisred, insertHistoryDB, userSearchHistory, showSearchHistoryLogic }

