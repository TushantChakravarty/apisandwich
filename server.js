'use strict';

console.log('');
console.log('//API SANDWICH BACKEND//');
console.log('');
require('dotenv').config();
var res = require('dotenv').config();
const appUtils = require('./lib/appUtils')
const market = require('./lib/Market/marketDao')
const MarketUtilities = require('./lib/Market/marketUtilities')
//Import Config
const config = require('./lib/config');
// const socket = require("socket.io");

 config.dbConfig((err) => {
  if (err) {
    // logger.error(err, 'exiting the app.');

    console.log({ err });
    return;
  }

  // load external modules
  const express = require('express');

  // init express app
  const app = express();

  // config express
  config.expressConfig(app);
  if (err) return res.json(err);

  // attach the routes to the app
  require('./lib/routes')(app);


const port=2000
  // start server
  const server = app.listen(port, () => {
    console.log(`Express server listening on ${port}`);
    // logger.info(`Express server listening on ${config.cfg.port}, in ${config.cfg.TAG} mode`);
  });

 
});
/**
 * 
 * "email": "tushant029",
        "password": "85ihqtkzgiznoaxtfy8a",
        "apiKey": "uhj10xf4gad"
 * 
 * "emailId": "tushantxyzz",
    "apiKey": "q34uc0r7ny"

    admin credentials
    
 "email": "samir@payhub",
        "password": " mkali126",
        "apiKey": "eje92rqgxbf"


         "email": "tushant2909@gmail.com",
        "password": "62pmjrgbl97uvlxer8kh",
        "apiKey": "1iqj733f3xt"
 */