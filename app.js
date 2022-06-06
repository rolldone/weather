var axios = require("axios");
var shelljs = require("shelljs");
const writeYamlFile = require('write-yaml-file')
require('dotenv').config();

axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${process.env.LAT}&lon=${process.env.LAT}&appid=${process.env.API_KEY}`).then(function (data) {
  writeYamlFile('weather.yaml', data.data).then(() => {
    console.log('done')
  })
  axios.post("http://192.168.50.4:3000/xhr/webhook/execute", {
    data: JSON.stringify({ 
      "subject": `${process.env.JOB_ID}`, 
      "message": `${process.env.LINK}` })
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`
    }
  })
}).catch(function (ex) {
  console.log(ex);
})