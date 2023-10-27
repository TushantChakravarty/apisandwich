const crypto = require('crypto');
const axios = require('axios');
const fetch = require("node-fetch");

const sendAirpayQrRequest = async (details) => {
  console.log('check', details)
  const response = await fetch("https://kraken.airpay.co.in/airpay/api/generateOrder.php", {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'AuthKey': 'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
    },
    body: JSON.stringify(
      {
        encData: details.encryptedData,
        checksum: details.checksum,
        mid: "294431"

      })
  })
    .then(resp => resp.json())
    .then(json => {
      if (json)
        return json
      return false
    })
    .catch((error) => {
      console.log(error)
    })
  return response

}
const check = ()=>{
  

const mercid = '294431';
  const secretKey = "4z74sYwdqYUX6Pgv";
  const username = 'DIGISLTS678760'
  const password = "TSAWRIL@8gh75kf"
  const secret = '4z74sYwdqYUX6Pgv'

  const key256 = crypto.createHash('sha256').update(`${username}~:~${password}`).digest('hex');

const orderid = '230918184855912BuA4lwHk';
const amt = '300.00';
const buyerPhone = '9999999999';
const buyerEmail = 'test@gmail.com';
const mer_dom = Buffer.from('http://localhost').toString('base64');
const call_type = 'upiqr';

const alldata = mercid + orderid + amt + buyerPhone + buyerEmail + mer_dom + call_type;
const currentDate = new Date().toISOString().split('T')[0];

// Append the current date to key256, alldata, and then calculate $checksum equivalent
const checksumData = key256 + '@' + alldata + currentDate;
const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');



  console.log(checksum)
  const data = {
    mercid,
    orderid,
    amount: amt,
    buyerPhone,
    buyerEmail,
    mer_dom,
    call_type,
  };
  
  const encKey = crypto.createHash('md5').update(secret).digest('hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv);
  let encData = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encData += cipher.final('base64');
  
  const postData = JSON.stringify({ encData, checksum, mercid });
  
  axios
    .post('https://kraken.airpay.co.in/airpay/api/generateOrder.php', postData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      console.log(response)
      const redData = response.data;
      const encryptedData = redData.data;
      console.log(encryptedData)
      const iv = Buffer.alloc(16); // Ensure the IV is 16 bytes
      const encrypted = encryptedData.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey), iv);
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      console.log(decrypted);
    })
    .catch((error) => {
      console.error(error);
    });
  //jj
}

function encryptAirpayRequest() {



// Execute the PHP code
  const mercid = '294431';
  const secretKey = "4z74sYwdqYUX6Pgv";
  const username = 'DIGISLTS678760'
  const password = "TSAWRIL@8gh75kf"
  const secret = '4z74sYwdqYUX6Pgv'
  const keySeed = crypto.createHash('md5').update(secret).digest('hex');

// Expand the 128-bit MD5 hash to a 256-bit key using a KDF
const encKey = crypto.pbkdf2Sync(keySeed, 'salt', 100000, 32, 'sha256'); // Derive a 256-bit key

const orderid = "230918184855912BuA4lwHk";
const amt = "300.00";
const buyerPhone = "9999999999";
const buyerEmail = "test@gmail.com";
const mer_dom = Buffer.from('http://localhost').toString('base64');
const call_type = "upiqr";

const alldata = mercid + orderid + amt + buyerPhone + buyerEmail + mer_dom + call_type;

const checksum = crypto.createHash('sha256').update(keySeed + '@' + alldata + (new Date()).toISOString().slice(0, 10)).digest('hex');

const fields = {
  mercid: mercid,
  orderid: orderid,
  amount: amt,
  buyerPhone: buyerPhone,
  buyerEmail: buyerEmail,
  mer_dom: mer_dom,
  call_type: call_type,
};

const json_data = JSON.stringify(fields);

const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
let encData = cipher.update(json_data, 'utf8', 'base64');
encData += cipher.final('base64');

  const postData = { encData: encData, checksum, mercid: mercid, encKey };
 return postData
  // const options = {
  //   hostname: 'kraken.airpay.co.in',
  //   path: '/airpay/api/generateOrder.php',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': Buffer.byteLength(postData)
  //   }
  // };

  // const req = https.request(options, (res) => {
  //   let data = '';

  //   res.on('data', (chunk) => {
  //     data += chunk;
  //   });

  //   res.on('end', () => {
  //     const redData = JSON.parse(data);
  //     const encryptedData = redData.data;
  //     const iv = encryptedData.slice(0, 16);
  //     const encryptedDataStr = encryptedData.slice(16);
  //     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey, 'hex'), Buffer.from(iv, 'hex'));
  //     let decryptedData = decipher.update(Buffer.from(encryptedDataStr, 'base64'), 'binary', 'utf8');
  //     decryptedData += decipher.final('utf8');
  //     console.log(decryptedData);
  //   });
  // });

  // req.on('error', (error) => {
  //   console.error(error);
  // });

  // req.write(postData);
  // req.end();

}

function decryptAirpayResponse(data, encKey) {
  try {
    console.log(data,encKey)
    const encryptedData = data;
    console.log(encryptedData)
    const iv = encryptedData.slice(0, 16);
    const encryptedDataStr = encryptedData.slice(16);
    console.log(encryptedDataStr)
    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
    decipher.setAutoPadding(true); // Set to use PKCS7 padding

    let decryptedData = decipher.update(Buffer.from(encryptedDataStr, 'base64'), null, 'utf8');
    console.log(decryptedData)
    decryptedData += decipher.final('utf8');
    
    console.log('My Decrypt Data', decryptedData);
  } catch (error) {
    console.error('Exception in decrypt:', error);
  }
}

module.exports = {
  sendAirpayQrRequest,
  encryptAirpayRequest,
  decryptAirpayResponse,
  check
}