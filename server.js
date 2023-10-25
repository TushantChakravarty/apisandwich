'use strict';

console.log('');
console.log('//API SANDWICH BACKEND//');
console.log('');
require('dotenv').config();
var res = require('dotenv').config();
const cron = require('node-cron');
const { exec } = require('child_process');
const config = require('./lib/config');
const { myFunction } = require('./lib/user/scheduler/scheduler');
// Schedule your script to run at midnight IST (UTC+5:30)
cron.schedule('30 18 * * * *', async () => {
  console.log('Running your Node.js script...');
  exec('node ./lib/user/scheduler/scheduler.js', async (error, stdout, stderr) => {
    if (error) {
      console.error('Error running scheduler.js:', error);
    } else {
      
        
        await myFunction();
     
    }
   
  });
});
// const appUtils = require('./lib/appUtils')
// const market = require('./lib/Market/marketDao')
// const MarketUtilities = require('./lib/Market/marketUtilities')
//Import Config

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

    admin credential
    
 "email": "samir@payhub",
        "password": " mkali126",
        "apiKey": "eje92rqgxbf"


         "email": "tushant2909@gmail.com",
        "password": "62pmjrgbl97uvlxer8kh",
        "apiKey": "1iqj733f3xt"

        "email": "samir123@payhub",
        "password": "8s5ozglbdxpo7vupqpg1",
        "apiKey": "dk3lonopa4i"

250955
        user

         email: 'jonty128@gmail.com',
  password: '7kjvytthm1tfwv2npkoj',
  apiKey: 'U2FsdGVkX1/pe02WKy2VrritbExuKdW/zyjTYJ0PJiE='

   "email": "tushant2907@gmail.com",
        "password": "tushant2907",
        "apiKey": "U2FsdGVkX19nJYUKRmoF3i/7Q/g8kKovBQ78miTfsI4="

        Email id: tushant29089@gmail.com
Password: flejoi2fc3rqn5t874ch
Apikey: U2FsdGVkX18jB5Et3CNmzR8q5Zdrz3cHixHyUyGdUYs=
 */