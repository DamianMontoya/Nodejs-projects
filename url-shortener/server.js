const express = require ('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 5005;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => 
{
    const long_url = req.query.url;
  
    try 
    {
        const response = await axios.get(`https://api.shrtco.de/v2/shorten?url=${long_url}`);        res.json(response.data);
    } 
    catch (error) 
    {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () =>
{
    console.log('Server up and listening in port ', port);
})