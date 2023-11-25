import inquirer from 'inquirer';
import { createUser, findUserByEmail, updateUserEmail, updateUserName, findUserById, updateUserPassword, deleteUser, userEmailIsRegisred, userSearchHistory, showSearchHistoryLogic } from './models/User.js';
import chalk  from 'chalk';
import { getData, logWeather } from './aemet-request.js';
import bcrypt from 'bcrypt';
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
            validate: function (choice)
            {
                return choice === 'Log in' || choice === 'Sign up' ? true : console.log('You must chose one option');
            }
        },
      ])
      console.clear();
      signInSignUp.choice === 'Log in' ? await logIn() : await signUp(); 
};
// manejo de errores en log in, si fallas tres veces te da opcion de volver al signUp
async function logInAttempts ()
{
    if(count >= 3)
    {
        count = 0;
        console.clear();
        await goPreviousMenu();
    }
};

async function logInPrompt()
{
    const emailPrompt =
    {
        type: 'input',
        name: 'email',
        message: 'Enter your email: ',

    };

    const passwordPrompt = 
    {
        type: 'password',
        name: 'password',
        message: 'Enter your password with at least 6 characters and one number: ',
        validate: validatePassword  
    };

    const { email, password } = await inquirer.prompt([emailPrompt, passwordPrompt])

    return { email, password };
};

// No se si esta deberia refactorizarla, hace dos cosas: buscar / validar usuario
// Pero es sencilla, no se si tiene sentido...
async function findUser (email)
{
    try
    {
    // busca en la base de datos un usuario por email y devuelve obj toda la info
    currentUser = await findUserByEmail(email);
    }
    catch
    {
        console.log('Error during the database searching...')
    }
    return currentUser;
};
// esta funcion comprueba que el usuario existe y la contraseña coinciden, si es asi llama al menu principal
// en la App se llama tambien al menu al terminar log In, o se elima esto o el flujo de la App principal
// PROBLEMA: o se llama aqui a User Menu o en la App. Decidir flujo y refactorizar
async function validateUser (currentUser, password)
{
    if(currentUser !== null)
    {
        const passwordsMatch = await bcrypt.compare(password, currentUser.password)
        if(passwordsMatch)
        {
        console.log('Welcome ', currentUser.userName);
        }
        else
        {
            count ++;
            console.clear();
            console.log('Incorrect password...')
            await logIn(); 
        }
        
    }
    else
    {
        count ++;
        console.clear();
        console.log('The email is not registered...')
        await logIn();
    }
};
// pantalla de login
async function logIn ()
{
    try
    {
    console.log(chalk.bgGreen('------------- LOG IN-------------'));

    // si se ha intentado logear tres veces seguidas se le da la opcion de ir al SignUp
    await logInAttempts();

    // se extrae el email y contraseña del prompt
    const {email, password} = await logInPrompt();

    // devuelve un usuario de la DB
    currentUser = await findUser(email);
    
    console.clear()
    // valida el usuario,
    await validateUser(currentUser, password)
    }
    catch
    {
        console.log('Error during the log in process..');
    }
};
// si el usuario falla 3 veces el logIn se llama a esta funcion y le da la opcion de volver atras sin que pete el programa
async function goPreviousMenu()
{
    console.log(chalk.red('Do you want to go back?'));
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

};


async function validateEmail(input)
{
    const validEmail = /\S+@\S+\.\S+/.test(input);
    const emailIsRegistered = await userEmailIsRegisred(input)
    if(validEmail && !emailIsRegistered)
    {
        return true;
    }
    else if(!validEmail)
    {
        return 'Enter a valid email...'
    }
    else
    {
        return 'The email is logged...'
    }
};

// validador de password para logIn
function validatePassword(input)
{
    const validPassword = !(input.length < 6) && /[0-9]/.test(input);

    return validPassword ? true : 'You must enter a valid password, it has to be 6 characters including at least 1 number';
};

function validateUserName(input)
{
    const validUserName = !(input.length <= 5) && !(/[0-9]/.test(input));

    return validUserName ? true : 'Your username cant contain numbers and it has to be at least 5 letters';
};


async function signUpPrompt()
{
    console.log(chalk.bgGreen('------------- SIGN UP-------------'));
    const {userName, email } = await inquirer.prompt([
        {
            type: 'input',
            name: 'userName',
            message: 'Enter your user name: ',
            validate: validateUserName
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email: ',
            validate: validateEmail
        },
    ]);

    const password = await confirmPassword();

    return { userName, email, password };
};

async function confirmPassword()
{

    let password, confirmPassword;
    do
    {
        const passwordPrompt = 
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password: ',
            validate: validatePassword,
        };
    
        const confirmPasswordPrompt = 
        {
            type: 'password',
            name: 'confirmPassword',
            message: 'Enter your password: ',
        };
        ({ password, confirmPassword } = await inquirer.prompt([ passwordPrompt, confirmPasswordPrompt]));
        if(password !== confirmPassword)
        {
            console.clear();
            console.log('Passwords dont match, try again');
        }
    }while(password !== confirmPassword)
    return password;
}

async function userCreateHandleError (userName, email, password)
{
    //consulta a la BD si existe, true = usuario, false = null
    const userExists = await findUserByEmail(email);
    
    if(userExists === null)
    {
        await createUser(userName, password, email);
        console.clear();
        await logIn();
    }
    else
    {
        console.log('This email is logged...');
        await signUp();
    }
};

async function signUp()
{
    try
    { 
    const {userName, email, password } = await signUpPrompt();
    
    await userCreateHandleError(userName, email, password);
    }
    catch(error)
    {
        console.log('Error during the sign up process...')
    }
}


// MANEJAR LA ELECCION DEL USUARIO
async function showUserMainMenu() 
{
    console.clear();
    console.log(chalk.bgGreen('------------- MENU-------------'));
    const {choice} = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: chalk.yellow(`Welcome ${currentUser.userName} \n - Select an option:`),
      choices: [
        { value: 'weather', name: chalk.cyan('1. Search weather') },
        { value: 'history', name: chalk.cyan('2. Searching history') },
        { value: 'userProfile', name: chalk.cyan('3. View and change my profile') },
        { value: 'exit', name: chalk.red('4. Exit') }],
    }
    ])
    
    await userMainMenuHandler(choice);   
};

async function goBack (currentUser)
{
    const {choice} = await inquirer.prompt([
    {
            type: 'list',
            name: 'choice',
            message: chalk.yellow('Select an option:\n'),
            choices: [ 'Search another city weather', 'Go back to main menu', 'See my search history'],
            //validate: function (choice)
            //{
            //    return choice === 'Search another city weather' || choice === 'Go back to main menu' ? true : console.log('You must chose one option');
            //}
    }])

    if(choice === 'Search another city weather')
    {
        await userMainMenuHandler('weather');
    }
    else if(choice === 'Go back to main menu')
    {
        await showUserMainMenu();
    }
    else
    {
        await userMainMenuHandler('history');
    }
};
// COMBINAR LOS DOS MENU HANDLERS EN ESTE, CON UN SWITCH BASTA PARA MANEJAR TODAS LAS RESPUESTAS AKA userResponseHandler(choicita)
async function userMainMenuHandler(choice) 
{
    switch (choice) 
    {
        case 'weather':
            const data = await getData(currentUser);
            await logWeather(data);
            await goBack(currentUser);
            break;
    
        case 'history':
            console.clear();
            await showSearchHistoryLogic(currentUser);
            await goBack(currentUser);
            break;  
    
        case 'userProfile':
            showUserProfileMenu();
            break;
        
        case 'exit':
            console.log(chalk.red('Exiting...'));
            process.exit(1);

        default:
            console.log(chalk.red('Invalid choice. Please try again.'));
            await showUserMainMenu();
  };
};

async function showUserProfileMenu()
{
  console.clear();
  console.log(chalk.whiteBright(`Hi ${currentUser.userName}, your current email is ${currentUser.email}, what do you want to do?`))
  const {choice} = await inquirer.prompt([
    {
        type: 'list',
        name: 'choice',
        message: chalk.yellow('Select an option:'),
        choices: [
            { value: 'ChangePassword', name: chalk.cyan('1. Change password') },
            { value: 'ChangeEmail', name: chalk.cyan('2. Change email') },
            { value: 'ChangeUserName', name: chalk.cyan('3. Change userName') },
            { value: 'DeleteUser', name: chalk.cyan('4. Delete my profile') },
            { value: 'menu', name: chalk.red('5. Go back to the main menu') }]
    }
    ])
        userProfileMenuHandler(choice);
};


// manejo del menu usuario
async function userProfileMenuHandler(choice) 
{
    switch (choice) 
    {
    case 'ChangePassword':
        console.clear(); // <= comprobar el clear console y compararlo con changeEmail de abajo
        await changePassword();
        break;

    case 'ChangeEmail':
        await changeEmail();      
        break;  

    case 'ChangeUserName':
        await changeUserName();
        break;

    case 'DeleteUser':
        await deleteUserProfile();
        break;

    case 'menu':
        console.log(chalk.red('Go back to the menu...'));
        await showUserMainMenu();
        break;

    default:
        console.log(chalk.red('Invalid choice. Please try again.'));
        showUserProfileMenu();
        break;
    };
};

// LAS TRES DE ABAJO CAMBIAN CONTRASEÑA
// pide la nueva password por prompt
async function changePasswordPrompt()
{
    console.clear();
    const newPassword = await confirmPassword();
    return newPassword;
};

// cambia la password en BD y updatea el usuario a nivel global currentUser
async function updatePassword(newPassword)
{
    //update the new password
    await updateUserPassword(currentUser._id, newPassword);
    //updates current user with new password
    currentUser = await findUserById(currentUser._id);
};

async function changePassword ()
{
    try
    {
        // get the new password
        const newPassword  = await changePasswordPrompt();
        //update the new password and updates globally user
        await updatePassword(newPassword);
        // goes to profile menu
        await showUserProfileMenu();
    }
    catch
    {
        console.log('Error changing the password...');
        await showUserProfileMenu();
    }
};

// LAS TRES DE ABAJO CAMBIAN EMAIL
async function changeEmailPrompt()
{

    const { newEmail } = await inquirer.prompt([
        {
           type: 'input',
           name: 'newEmail',
           message: chalk.yellow('Enter your new email: '),
           validate: validateEmail
        }
    ]);
    return newEmail;
};

async function updateEmail(newEmail)
{
    await updateUserEmail(currentUser._id, newEmail);
    currentUser = await findUserById(currentUser._id);
};

async function changeEmail()
{
    try
    { 
        console.clear();
        const newEmail = await changeEmailPrompt();
        await updateEmail(newEmail);
        await showUserProfileMenu();
    }
    catch(error)
    {
        console.log('Error changing the password process...');
        await showUserProfileMenu()
    }
};

// LAS TRES DE ABAJO CAMBIAN USERNAME
async function changeUserNamePrompt()
{
    console.clear();
    const { newUserName } = await inquirer.prompt([
    {
        type: 'input',
        name: 'newUserName',
        message: chalk.yellow('Enter your new user name: '),
        validate: validateUserName
    }]);
    return newUserName;
};

async function updateNewUserName(newUserName)
{
    await updateUserName(currentUser._id, newUserName);
    currentUser = await findUserById(currentUser._id);
};

async function changeUserName()
{
    try
    {
        console.clear();
        const newUserName = await changeUserNamePrompt();
        await updateNewUserName(newUserName);
        await showUserProfileMenu();
    }
    catch(error)
    {
        console.log('Error during the user name change process...');
        await showUserProfileMenu();
    }
};


// LAS CUATRO DE ABAJO ELIMINAN EL USUARIO
async function deleteUserPrompt()
{
    console.clear();
    const { deleteConfirmation } = await inquirer.prompt([
    {
        type: 'input',
        name: 'deleteConfirmation',
        message: chalk.yellow("Are sure you want to delete profile? Type 'yes' to delete and 'no' to exit: "),
        validate: validateDeleteUserPrompt
    }]);

    return deleteConfirmation;
};

function validateDeleteUserPrompt(input)
{
    if(input !== 'yes' && input !== 'no')
    {
        console.clear();
        console.log("You must type 'yes' to delete and 'no' to exit");
        return false;
    }
    else
    {
        return true;
    }
};
async function deleteUserPromptHandler(deleteConfirmation)
{
    if(deleteConfirmation === 'yes')
    {
        await deleteUser(currentUser._id);
        currentUser = null;
        console.log(chalk.red('Your profile has been deleted')); //esto no se llega a ver porque en logInSignUp hay un clear()
        await logInSignUp();
    }
    else
    {
        showUserProfileMenu();
    }
};

async function deleteUserProfile()
{
    console.clear();
    const deleteConfirmation = await deleteUserPrompt();
    await deleteUserPromptHandler(deleteConfirmation);
};


// PENDIENTE: leer docu de Mongoose, las querys devuelven query objects pero y si se usa la sintaxis .exec() ? 

export { showUserProfileMenu, userProfileMenuHandler, showUserMainMenu, signUp, logIn, logInSignUp, userMainMenuHandler, goPreviousMenu, goBack }