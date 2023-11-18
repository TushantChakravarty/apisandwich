'use strict';

console.log('');
console.log('//API SANDWICH BACKEND//');
console.log('');
require('dotenv').config();
var res = require('dotenv').config();
const cron = require('node-cron');
const { exec } = require('child_process');
const config = require('./lib/config');
const { myFunction, test, pushGatewayDetails, getPendingTx } = require('./lib/user/scheduler/scheduler');
const { decryptParameters } = require('./lib/appUtils');
const fs = require('fs');
const { fetchDataForCurrentDate } = require('./lib/user/gatewayDao');
const adminDao = require('./lib/user/adminDao')
// const func = async ()=>{

//   const data = await adminDao.getAllTransactionWithSuccessStatus('sameerdev1203@gmail.com')
//   console.log(data)
// }
// func()
// const func = async ()=>{
//   const currentDate = new Date().toISOString().split('T')[0];
//   const admin = await adminDao.getUserDetails({
//     emailId: 'samir123@payhub'
//   });
//   const update ={
//     lastExecutionDate:currentDate
//   }
//   adminDao.updateProfile({
//     emailId: 'samir123@payhub'
//   },update)
// }
// func()
// const currentDate = new Date().toISOString().split('T')[0];

// const DATE_FILE = './data/info/last_execution_date.txt';
// const lastExecutionDate = fs.existsSync(DATE_FILE)
// ? fs.readFileSync(DATE_FILE, 'utf8').trim()
// : null;
// fs.writeFileSync(DATE_FILE, currentDate);

// console.log('last date',lastExecutionDate)
//const { getGatewayDetails } = require('./lib/user/adminDao');
// Schedule your script to run at midnight IST (UTC+5:30)
//myFunction()
// const func =async ()=>{
//   pushGatewayDetails()
//   .then(async ()=>{
   

//   }).finally(async ()=>{
//     const data =await fetchDataForCurrentDate()
//     console.log(data)
//   })
// }
// func()

// const phonepe = ()=>{
//   // Your JSON payload
//   const data ={
//     "merchantId": "M15N4WTCAKPN",
//     "merchantTransactionId": "MT7850590068188104",
//     "merchantUserId": "0b1ab943-cf1b-49cd-84a5-27131fcb909f",
//     "amount": 10000,
//     "redirectUrl": "https://webhook.site/redirect-url",
//     "redirectMode": "REDIRECT",
//     "callbackUrl": "https://webhook.site/callback-url",
//     "mobileNumber": "9999999999",
//     "paymentInstrument": {
//       "type": "PAY_PAGE"
//     }
//   }
// // Convert JSON to string and encode to Base64
// const base64Payload = Buffer.from(JSON.stringify(data)).toString('base64');

// console.log(base64Payload);

// }

// phonepe()
// Schedule the cron job to run at 6:30 PM UTC daily
//getPendingTx()
cron.schedule('0 30 18 * * *',async  () => {
  // Get the last execution date from the file
  const admin = await adminDao.getUserDetails({
    emailId: 'samir123@payhub'
  });
  const lastExecutionDate = admin.lastExecutionDate

  // Get the current date
  const currentDate = new Date().toISOString().split('T')[0];

  // Check if the function has not been executed today
  if (lastExecutionDate !== currentDate) {
    // Run your function
    myFunction();
    console.log('running')

    // Update the last execution date in the file
    //fs.writeFileSync(DATE_FILE, currentDate);
    const update ={
      lastExecutionDate:currentDate
    }
    adminDao.updateProfile({
      emailId: 'samir123@payhub'
    },update)
  }
});

// cron.schedule('0 30 18 * * *', async () => {
//   console.log('Running your Node.js script...');
//   exec('node ./lib/user/scheduler/scheduler.js', async (error, stdout, stderr) => {
//     if (error) {
//       console.error('Error running scheduler.js:', error);
//     } else {
      
        
//         await myFunction();
     
//     }
   
//   });
// });
//const decrypt = decryptParameters('U2FsdGVkX1/frrl08RTnPPZWrXH7f5NzZNvvsN7rHFE25oM1CxTF9htqXX9MZ3JLLCwzJKlaibGUUXQw6zrnoJR9EW7S0lbUgLdJ/xqSRUG8svR4u2ol88huDW952d9f9C3BuJA/mMKS/x95zemDv0ibNclCkxB5cMrqL4sLiWcKLyq8PNDw0jkLoK4S3ccJUZ+XKvgohfxYTZAf0yY4EGGOwMiiM+ljrOsAnpVNF3apW0UuZaUJysbxY5JuQA6QVnZFQx5Ab+8hRHU94Vf5rA==',"0Ud3pRMqpT0M3qp9XP")
//console.log(decrypt)
// cron.schedule('0 30 18 * * *', async () => {
//   const today = new Date();
//   const isSameDay = today.getUTCHours() === 18 && today.getUTCMinutes() === 30;

//   if (!executed && isSameDay) {
//     console.log('Running your Node.js script...');
//     exec('node ./lib/user/scheduler/scheduler.js', async (error, stdout, stderr) => {
//       if (error) {
//         console.error('Error running scheduler.js:', error);
//       } else {
//         await myFunction();
//         executed = true;
//       }
//     });
//   } else {
//     executed = false; // Reset the flag for the next day
//   }
// });

// let executed = false;

// cron.schedule('0 30 18 * * *', async () => {
//   const today = new Date();
//   const isSameDay = today.getUTCHours() === 18 && today.getUTCMinutes() === 30;

//   if (!executed && isSameDay) {
//     console.log('Running your function...');
//     await myFunction();
//     executed = true;
//   } else if (executed && !isSameDay) {
//     executed = false; // Reset the flag for the next day
//   }
// });

//swipeLineUpi()

// const appUtils = require('./lib/appUtils')
// const market = require('./lib/Market/marketDao')
// const MarketUtilities = require('./lib/Market/marketUtilities')
//Import Config

// const socket = require("socket.io");
//test()
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


  const port = process.env.PORT || 2000;  // start server
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