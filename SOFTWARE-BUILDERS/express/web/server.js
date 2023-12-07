const express = require('express');
const path = require('path')
const session = require('express-session');
const {connectDB} = require('./src/helpers/db')
const {userRouter} = require('./src/routes/users.js');
const indexRouter = require('./src/routes/index.js');

const app = express();


app.use(express.json()); // acceder al body del req JSON

// middlewares
app.use(express.static(path.join(__dirname,  '/src/public'))); // me interesa que todo lo estatico se acceda directemente si estoy enrutando todo¿?
app.use(express.urlencoded({extended: false}));
app.use(session({secret: 'secretito', resave: true, saveUninitialized: true}));
// routes

app.use('/users', userRouter); // todo lo que pase por la ruta /users esta configurada en userRouter
app.use('/', indexRouter);

// configuracion puerto y server up
app.set('port', process.env.PORT || 6006)
app.listen(app.get('port'), async () =>
{
    await connectDB();
    console.log('Sever up on port ', app.get('port'));
});