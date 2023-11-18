import inquirer from 'inquirer';
import { createUser, findUserByEmail } from './models/User.js';
import chalk  from 'chalk';

let currentUser = null

async function logInSignUp ()
{

    const signInSignUp = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: chalk.yellow('Select an option:\n'),
            choices: [ 'Log in', 'Sign up'],
        },
      ])

      signInSignUp.choice === 'Log in' ? await logIn() : await signUp(); 
};

async function logIn ()
{
    
    console.log("--------------------- LOGIN")
    const {email, password} = await inquirer.prompt([
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email: ',
        },
        {
            type: 'input',
            name: 'password',
            message: 'Enter your password: ',
        },
    ])

    currentUser = await findUserByEmail(email);

    if(currentUser !== null && currentUser.password === password)
    {
      console.log('Welcome ', currentUser.userName);
      showUserMenu();
    }
    else
    {
      console.log('Incorrect password...')
      await logIn();
    }
};

async function signUp()
{
    console.log("--------------------- SIGNUP")
    const {userName, email, password } = await inquirer.prompt([
        {
            type: 'input',
            name: 'userName',
            message: 'Enter your user name: ',
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email: ',
        },
        {
            type: 'input',
            name: 'password',
            message: 'Enter your password: ',
        },
    ])

    // CHECK IF USER IS IN MONGODB DATABASE BY EMAIL, IF IS RETURN ERROR, IF IS NOT SAVE IN DB AND RETURN logIn();
    
    const userExists = await findUserByEmail(email);

    if(userExists === null)
    {
        await createUser(userName, password, email);
    }
    else
    {
        console.log('This email is logged...');
    }
    // mostrar pantalla del login al terminar
   await logIn();
};

// MANEJAR LA ELECCION DEL USUARIO
async function showUserMenu() 
{
    console.log("-------------------- USER MENU")
   const userResponse = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: chalk.yellow(`Welcome ${currentUser.userName} \n - Select an option:`),
      choices: [
        { value: 'weather', name: chalk.cyan('1. Search weather') },
        { value: 'history', name: chalk.cyan('2. Searching history') },
        {value: 'userProfile', name: chalk.cyan('3. View my profile')},
        { value: 'exit', name: chalk.red('4. Exit') }],
    }
    ])
    
    handleUserChoice(userResponse.choice);
    
};


function User(choice) 
{
  switch (choice) 
  {
    case 'weather':
        console.log(chalk.yellow('Waiting for the city...'));
        //displayData();
        break;

    case 'history':
        console.log(chalk.yellow('History search logic goes here...'));
        break;  
    
    case 'userProfile':
        console.log(chalk.yellow('Searching user info...'));
        break
    case 'exit':
        console.log(chalk.red('Exiting...'));
        process.exit(1);
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
      showUserMenu();
  };
};

async function displayUserInfo()
{
  const userChoice = await inquirer.prompt([
    {
        type: 'list',
        name: 'choice',
        message: chalk.yellow('Select an option:'),
        choices: [
            { value: 'ChangePassword', name: chalk.cyan('1. Change password') },
            { value: 'ChangeEmail', name: chalk.cyan('2. Change email') },
            { value: 'ChangeUserName', name: chalk.cyan('2. Change userName') },
            { value: 'menu', name: chalk.red('4. Go to the menu') }],
    }
    ])
        handleUserProfileChoice(userChoice.choice);
};

function handleUserProfileChoice(choice) 
{
    switch (choice) 
    {
    case 'ChangePassword':
        console.clear();
        console.log(chalk.yellow('Changing password...'));
        displayData();
        break;

    case 'ChangeEmail':
        console.log(chalk.yellow('Changing email...'));
        break;  
    case 'ChangeUserName':
        console.log(chalk.red('Changing name...'));
        process.exit(1);
        break
    case 'menu':
        console.log(chalk.red('Exiting...'));
        process.exit(1);
        break
    default:
        console.log(chalk.red('Invalid choice. Please try again.'));
        showUserMenu();
        break
    };
};



async function greetUser() 
{
    console.clear(); // Clear the console before displaying the greeting and animation
    console.log(chalk.blue(`Welcome to my very first program ${userName}, be kind`));   
    showUserMenu();
}



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
    showUserMenu();
}




export { displayUserInfo, handleUserChoice, showUserMenu, signUp, logIn, logInSignUp}