Weather App with User Authentication

This simple Node.js project is a weather App that allows users to know weather of any Spanish city the whole week getting data from AEMET. It uses a MongoDB database where the last 10 searches of the user are stored. It allows to search the weather, check user search history and a simple CRUD of user info. 

Features

- User authentication and password hashing before insert into MongoDB.
- Modify any user info: email, password, userName and erasing the profile.
- Get the weather of any spanish city for one week.
- User search history tracking.
- MongoDB as storage database.
- City suggestions based on user input quering the database.

Set up:
- MongoDB Connection: Set the 'DATABASE_URI' in the .env file in the root of the project to your MongoDB connection string. Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database-name>` with your actual MongoDB credentials. 
```env
DATABASE_URI=mongodb://<username>:<password>@<host>:<port>/<database-name>

- AEMET API KEY: get the api key in the AEMET website: https://shorturl.at/txL05 and paste it to AEMET_KEY variable in .env file.


Installation:
- Clone the repository: https://github.com/DamianMontoya/Nodejs-projects.git
- npm install 
- npm start