// docu API https://pages.tibush.com/shrtcode/shrtcode-developer-api-v2

document.addEventListener('DOMContentLoaded', function () {
    let response;

    const url_shortener = async () => {

        event.preventDefault();

        const long_url = document.getElementById('long-url').value;
        const short_url = document.getElementById('short-url');

        const response = await axios.get(`/api/shorten?url=${long_url}`);
        short_url.innerText = response.data.result.full_short_link;
    };

    const copy_url = () => 
    {
        const short_url = document.getElementById('short-url').innerText;
        navigator.clipboard.writeText(short_url);
        alert('URL copied!');
    };

    // Add event listener when clicked copy button that copies the shortened URL
    const copy_btn = document.getElementById('copy-url');
    copy_btn.addEventListener('click', copy_url);

    // Add event listener to the submit button to trigger the event and call url_shortener function
    const submit_btn = document.getElementById('submit-url');
    submit_btn.addEventListener('click', url_shortener);
});
