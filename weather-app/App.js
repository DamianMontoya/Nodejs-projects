// librerias generales
import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import dotenv from 'dotenv';
import { connectDB } from './src/helpers/database-moongose.js';
import { logInSignUp, showUserMainMenu} from './src/app_logic.js'
import { loadCityData } from './src/models/City.js';


// 1-  DB connection
await connectDB();

// 2- Loads the cities into database only the first time you run the App
await loadCityData('./src/data_city/municipios.json');

// 3- Login o Sign Up
await logInSignUp();

// 3 - await showUserMainMenu();