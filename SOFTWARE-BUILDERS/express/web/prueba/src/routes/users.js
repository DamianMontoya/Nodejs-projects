const {Router} = require('express');
const path = require('path');

const userRouter = new Router();

userRouter.get('/login', (req,res) =>
{
    const logInPath = path.resolve(__dirname, '../public/login.html');
    res.status(200).sendFile(logInPath);
});

userRouter.get('/signup', (req,res) =>
{
    const signUpPath = path.resolve(__dirname, '../public/signup.html');
    res.status(200).sendFile(signUpPath);
});

userRouter.post('/signup', (req,res) =>
{
    //console.log(req.body)
    //res.send('funsionando')
    const {userName, email, password, confirmPassword} = req.body;

    const errors = [];
    if(password != confirmPassword)
    {

    }
    if(password.length < 6)
    {

    }

    if(errors.length != 0)
    {

    }
    else
    {
        res.render('funsiona todo ok') // para render habra que utilizar un view engine, estudiar y cacharrear
    }

})
userRouter.use('*', (req,res) => { res.status(404).send('Users resource not find')});

module.exports =  {userRouter};