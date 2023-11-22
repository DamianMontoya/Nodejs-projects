// librerias generales
import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import dotenv from 'dotenv';
import { connectDB } from './helpers/database-moongose.js';
import { logInSignUp, showUserMainMenu} from './user_v3.js'


// 1- Conexion BBDD
await connectDB();



// 2- Login o registro
await logInSignUp();

// 3 - Menu principal, a partir de aqui el programa corre
await showUserMainMenu();