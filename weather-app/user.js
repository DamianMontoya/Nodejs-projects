import inquirer from 'inquirer';
import inquirer from 'inquirer';


async function logInSignUp ()
{
    const signInSignUp = inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: chalk.yellow('Select an option:'),
          choices: [ 'Log in', 'Sign up'],
        },
      ])

      signInSignUp.choice === 'Log in' ? logIn() : signUp(); 
};

async function logIn ()
{
    const UserCredentials = await inquirer.prompt([
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
    ]),

    // CHECK IF EMAIL IS IN DB, AND IF THE EMAIL AND PASSWORD MATCH. GRANT ACCESS
    // MY IDEA IS THAT FROM HERE THE PROGRAM REMEMBER THE LOGGED EMAIL SO IT CAN EXTRACT DATA IN ANY MOMENT
};

async function signUp()
{
    const newUserCredentials = await inquirer.prompt([
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
    ]),

    // CHECK IF USER IS IN MONGODB DATABASE BY EMAIL, IF IS RETURN ERROR, IF IS NOT SAVE IN DB AND RETURN logIn();
};

function showMenu() 
{
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: chalk.yellow('Select an option:'),
      choices: [
        { value: 'weather', name: chalk.cyan('1. Search weather') },
        { value: 'history', name: chalk.cyan('2. Searching history') },
        {value: 'userProfile', name: chalk.cyan('3. View my profile')},
        { value: 'exit', name: chalk.red('4. Exit') }],
    }
  ]).then((userResponse) => 
  {
    handleChoice(userResponse.choice);
  });
};


function handleChoice(choice) 
{
  switch (choice) 
  {
    case 'weather':
        console.log(chalk.yellow('Waiting for the city...'));
        displayData();
        break;

    case 'history':
        console.log(chalk.yellow('History search logic goes here...'));
        break;  
    
    case 'userProfile':
        console.log(chalk.yellow('Searching user info...'));
        displayUserInfo();

    case 'exit':
        console.log(chalk.red('Exiting...'));
        process.exit(1);

    default:
      console.log(chalk.red('Invalid choice. Please try again.'));

        showMenu();
  };
};

displayUserInfo()
{

}

