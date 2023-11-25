import {logInSignUp} from '../../user_v3.js';
import assert, { strictEqual } from 'node:assert';
import exp from 'node:constants';
import test from 'node:test';

/*
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
*/
test('If inquirer choice returns Log in it calls logIn()', () =>
{
    const current = 'mengano'
    const expected = 'fulano'
    strictEqual(current,expected)
})