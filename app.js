var axios = require("axios");
const { readFileSync, writeFileSync } = require("fs");
var shelljs = require("shelljs");
const writeYamlFile = require('write-yaml-file')
const moment = require("moment-timezone");
const ractive = require("ractive");
require('dotenv').config();

function greeting(moment) {
  const hour = moment.hour();
  if (hour > 16) {
    return "Evening";
  }
  if (hour > 11) {
    return "Afternoon";
  }
  return 'Morning';
}

let start = async () => {
  try {
    let resData = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${process.env.LAT}&lon=${process.env.LONG}&appid=${process.env.API_KEY}&units=metric`);
    let result = {};
    result.main = resData.data;
    result.main.current_time = moment().tz(process.env.TIMEZONE).format("YYYY-MM-DD HH:mm:ss")
    let forecast = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${process.env.LAT}&lon=${process.env.LONG}&appid=${process.env.API_KEY}&units=metric`);
    // Get a forecast
    result.forecast = forecast.data;
    let todays = [];
    let tomorrows = [];
    let catchGreeting = {};
    let catchTodays = {};
    let current = moment.tz(process.env.TIMEZONE);
    for (var a = 0; a < result.forecast.list.length; a++) {
      let item = result.forecast.list[a];
      let moment_dt_txt = moment.tz(item.dt_txt, "YYYY-MM-DD HH:mm:ss", true, process.env.TIMEZONE);
      if (current < moment_dt_txt && moment_dt_txt.isSame(current, "day") == true) {
        if (catchGreeting[greeting(moment_dt_txt)] == null) {
          catchGreeting[greeting(moment_dt_txt)] = true;
          item.greeting = greeting(moment_dt_txt);
          todays.push(item);
        }
      }
      if (current < moment_dt_txt && moment_dt_txt.isSame(current, "day") == false) {
        if (catchTodays[moment_dt_txt.format("DD")] == null) {
          catchTodays[moment_dt_txt.format("DD")] = true;
          tomorrows.push(item);
        }
      }
    }
    result.todays = todays;
    result.tomorrows = tomorrows;
    delete result.forecast;
    let content = readFileSync("template.html");
    let rr = ractive({
      template: content.toString(),
      data: result
    });
    writeYamlFile('weather.yaml', result, {
      noRefs: true
    }).then(() => {
      console.log('done')
    })
    writeFileSync('weather.html', rr.toHTML(), "utf-8");
  } catch (ex) {
    console.log("Open weather error :: ", ex);
  }
}

start();