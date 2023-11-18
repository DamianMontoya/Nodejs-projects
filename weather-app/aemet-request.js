import http from 'https'
import {AEMET_KEY}  from './helpers/env-parser.js'

const apiURL ={
        municipios:'maestro/municipios'
} 

let api_request = null

//////// metodo de control para cuando quieras traerte datos
api_request = apiURL.municipios

const options = {
  method: "GET",
  hostname: "opendata.aemet.es",
  path: `/opendata/api/${api_request}/?api_key=${AEMET_KEY}`,
  headers: {
    "cache-control": "no-cache"
  }
};


const req = http.request(options, function (res) {
  const chunks = [];
  let body

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", async function () {
    body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
