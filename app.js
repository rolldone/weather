var axios = require("axios");
var shelljs = require("shelljs");
const writeYamlFile = require('write-yaml-file')
require('dotenv').config();

axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${process.env.LAT}&lon=${process.env.LAT}&appid=${process.env.API_KEY}`).then(function (data) {
  writeYamlFile('weather.yaml', data.data).then(() => {
    console.log('done')
  })
}).catch(function (ex) {
  console.log(ex);
})