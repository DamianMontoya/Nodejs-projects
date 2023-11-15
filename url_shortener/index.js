const axios = require('axios');

// docu API https://pages.tibush.com/shrtcode/shrtcode-developer-api-v2

let response;

const url_shortener = async () =>
{
    const long_url = document.getElementById('long-url').value;
    const short_url = document.getElementById('short-link');

    const data = await axios.get(`https://api.shrtco.de/v2/shorten?url=${long_url}`);

    response = data.result.full_short_link;
    
    document.getElementById('short-url').innerHTML = response;
};

const copy_url = () =>
{
    navigator.clipboard.writeText(response);
    alert('URL copied!');
};

// Add event listener when clicked copy butn that copies the shortened url
const copy_btn = document.getElementById('copy-url');
copy_btn.addEventListener('click', copy_url);

// Add event listener to the submit button to trigger the event and call url_shortener func
const submit_btn = document.getElementById('submit-url');
submit_btn.addEventListener('click', url_shortener);