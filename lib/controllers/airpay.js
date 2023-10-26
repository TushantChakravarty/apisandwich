const crypto = require('crypto');

const sendAirpayQrRequest = async (details) => {
  console.log('check', details)
  const response = await fetch("https://kraken.airpay.co.in/airpay/api/generateOrder", {
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
        mid: "M294431"

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

function encryptAirpayRequest() {


  
  const mercid = '294431';
  const secretKey = "4z74sYwdqYUX6Pgv";
  const username = ' DIGISLTS678760'
  const password = "TSAWRIL@8gh75kf"
  const secret = '4z74sYwdqYUX6Pgv'
  const encKey = crypto.createHash('sha256').update(secret).digest();

const key256 = crypto.createHash('sha256').update(username + "~:~" + password).digest('hex');

const orderid = "230918184855912BuA4lwHk";
const amt = "300.00";
const buyerPhone = "9999999999";
const buyerEmail = "test@gmail.com";
const mer_dom = Buffer.from('http://localhost').toString('base64');
const call_type = "upiqr";

const alldata = mercid + orderid + amt + buyerPhone + buyerEmail + mer_dom + call_type;

const checksum = crypto.createHash('sha256').update(key256 + '@' + alldata + (new Date().toISOString().split('T')[0])).digest('hex');

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

const iv = crypto.randomBytes(16); // Generate a random 16-byte IV
const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
let encryptedData = cipher.update(json_data, 'utf8', 'base64');
encryptedData += cipher.final('base64');
const encData = iv.toString('hex') + encryptedData;

console.log(encData);

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
    const encryptedData = data;
    const iv = encryptedData.slice(0, 16);
    const encryptedDataStr = encryptedData.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey, 'hex'), iv);

    let decryptedData = decipher.update(Buffer.from(encryptedDataStr, 'base64'), 'base64', 'utf8');
    decryptedData += decipher.final('utf8');

    console.log('My Decrypt Data', decryptedData);
  } catch (error) {
    console.error('Exception in decrypt:', error);
  }
}

module.exports = {
  sendAirpayQrRequest,
  encryptAirpayRequest,
  decryptAirpayResponse
}