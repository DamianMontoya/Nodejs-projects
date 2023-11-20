import inquirer from 'inquirer';
import { createUser, findUserByEmail, updateUserEmail, updateUserName, findUserById, updateUserPassword, deleteUser } from './models/User.js';
import chalk  from 'chalk';

let currentUser = null
let count = 0;

async function logInSignUp ()
{
    console.clear();
    console.log(chalk.bgGreen('-------------WELCOME TO MY HUMBLE WEATHER APP-------------'));

    const signInSignUp = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: chalk.yellow('Select an option:\n'),
            choices: [ 'Log in', 'Sign up'],
        },
      ])
      console.clear();
      signInSignUp.choice === 'Log in' ? await logIn() : await signUp(); 
};

async function logIn ()
{
    if(count >= 3)
    {
        count = 0;
        console.clear();
        await goPreviousMenu();
    }
    console.log(chalk.bgGreen('------------- LOG IN-------------'));

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
        // AQUI HAY QUE AÑADIR VALIDACION, IDEA: SEPARAR LOS PROMPTS
        // EN FORMA DE EMAILPROMPT /PASSWORDPROMPT, VALIDARLOS Y LUEGO 
        // LLAMAR AL INQUIRER
    ])

    currentUser = await findUserByEmail(email);
    
    if(currentUser !== null && currentUser.password === password)
    {
      console.log('Welcome ', currentUser.userName);
      showUserMainMenu();
    }
    else if(currentUser === null)
    {
        count ++;
        console.clear();
        console.log('The email is not registered...')
        await logIn();
    }
    else
    {
        count ++;
        console.clear();
        console.log('Incorrect password...')
        await logIn();
    }
};
// si el usuario falla 3 veces el logIn se llama a esta funcion y le da la opcion de volver atras sin que pete el programa
async function goPreviousMenu()
{
    console.log(chalk.red('You seem stuck... Want to go back?'));
    const { goBack } = await inquirer.prompt([
        {
            type: 'input',
            name: 'goBack',
            message: 'Type yes to go back, no to keep in this screen',
            validate: function(input)
            {
                if(input.toLowerCase() === 'yes' || input.toLowerCase() === 'no')
                {
                    return true;
                }
                else
                {
                    return 'Please type yes to go back and no to keep in this screen';
                }
            }
        },
    ])
    console.clear();
    goBack === 'yes' ? await logInSignUp() : await logIn();

}
async function signUp()
{
    console.log(chalk.bgGreen('------------- SIGN UP-------------'));
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
        console.clear();
    }
    else
    {
        console.log('This email is logged...');
    }
    // mostrar pantalla del login al terminar
    await logIn();
};

// MANEJAR LA ELECCION DEL USUARIO
async function showUserMainMenu() 
{
    console.clear();
    console.log(chalk.bgGreen('------------- MENU-------------'));
    const userResponse = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: chalk.yellow(`Welcome ${currentUser.userName} \n - Select an option:`),
      choices: [
        { value: 'weather', name: chalk.cyan('1. Search weather') },
        { value: 'history', name: chalk.cyan('2. Searching history') },
        {value: 'userProfile', name: chalk.cyan('3. View and change my profile')},
        { value: 'exit', name: chalk.red('4. Exit') }],
    }
    ])
    
    userMainMenuHandler(userResponse.choice);   
};


function userMainMenuHandler(choice) 
{
  switch (choice) 
  {
    case 'weather':
        askCity();
        break;

    case 'history':
        console.log(chalk.yellow('History search logic goes here...'));
        break;  
    
    case 'userProfile':
        showUserProfileMenu();
        break
    case 'exit':
        console.log(chalk.red('Exiting...'));
        process.exit(1);
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
      showUserMainMenu();
  };
};

async function showUserProfileMenu()
{
  console.clear();
  console.log(chalk.whiteBright(`Hi ${currentUser.userName}, your current email is ${currentUser.email}, what do you want to do?`))
  const userChoice = await inquirer.prompt([
    {
        type: 'list',
        name: 'choice',
        message: chalk.yellow('Select an option:'),
        choices: [
            { value: 'ChangePassword', name: chalk.cyan('1. Change password') },
            { value: 'ChangeEmail', name: chalk.cyan('2. Change email') },
            { value: 'ChangeUserName', name: chalk.cyan('3. Change userName') },
            {value: 'DeleteUser', name: chalk.cyan('4. Delete my profile') },
            { value: 'menu', name: chalk.red('5. Go back to the main menu') }]
    }
    ])
        userProfileMenuHandler(userChoice.choice);
};


// DEBERIA SACAR LA LOGICA FUERA DEL CASE Y CREAR UNA FUNCION PARA QUE SEA MÁS LIMPIA  aunque ya tenga una query para esto sin el prompt? nomenclatura duplicada¿?
// SI NO PONGO console.clear() antes de cada inicio de case se duplica el mensaje del inquirer.prompt- POR QUÉ
// ESTA FUNCION ES ENORME, PINTA FEO, HAY QUE REFACTORIZAR
async function userProfileMenuHandler(choice) 
{
    switch (choice) 
    {
    case 'ChangePassword':
        console.clear();
        const { newPassword } = await inquirer.prompt([
          {
             type: 'input',
             name: 'newEmail',
             message: chalk.yellow('Enter your new password: '),
          }
         ]);
         await updateUserPassword(currentUser._id, newPassword);
         currentUser = await findUserById(currentUser._id);
         showUserProfileMenu();
         {

         }
        break;

    case 'ChangeEmail':
        console.clear();
        const { newEmail } = await inquirer.prompt([
         {
            type: 'input',
            name: 'newEmail',
            message: chalk.yellow('Enter your new email: '),
         }
        ]);
        
        await updateUserEmail(currentUser._id, newEmail);
        currentUser = await findUserById(currentUser._id);
        showUserProfileMenu();
        break;  

    case 'ChangeUserName':
        console.clear();
        const { newUserName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'newUserName',
            message: chalk.yellow('Enter your new user name: '),
          }
        ]);
        await updateUserName(currentUser._id, newUserName);
        // con esto actualizas los datos cada vez que se haga un update
        currentUser = await findUserById(currentUser._id);
        showUserProfileMenu();
        break;

    case 'DeleteUser':
      console.clear();
      const { deleteConfirmation } = await inquirer.prompt([
        {
          type: 'input',
          name: 'deleteConfirmation',
          message: chalk.yellow("Are sure you want to delete profile? Type 'yes' to delete and 'no' to exit: "),
          validate(deleteConfirmation)
          {
              if(deleteConfirmation !== 'yes' && deleteConfirmation !== 'no')
              {
                  console.clear();
                  console.log("You must type 'yes' to delete and 'no' to exit");
                  return false;
                }
              return true;
          },
        }
      ]);

      if(deleteConfirmation === 'yes')
      {
        await deleteUser(currentUser._id);
        console.clear();
        console.log(chalk.red('Your profile has been deleted'));
        await signUp();
      }
      else
      {
        showUserProfileMenu();
      };
      break;

    case 'menu':
        console.log(chalk.red('Go back to the menu...'));
        showUserMainMenu();
        break;

    default:
        console.log(chalk.red('Invalid choice. Please try again.'));
        showUserProfileMenu();
        break;
    };
};

// Esta funcion ya no vale.
/*
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
}
*/
// PENDIENTE: leer docu de Mongoose, las querys devuelven query objects pero y si se usa la sintaxis .exec() ? 
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
    console.log(userInput.city);

    const city = (userInput.city.chartAt(0).toUpperCase() + userInput.city.slice(1).toLowerCase()).trim();
    console.log(typeof city);
    return city;
};

export { showUserProfileMenu, userProfileMenuHandler, showUserMainMenu, signUp, logIn, logInSignUp}