// load all dependencies
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require('jsonwebtoken'));
var appConstants = require('./constants');
const { responseMapping } = require('./user/userMapper');
const { MESSAGE } = require('./user/userConstants');
var TOKEN_EXPIRATION_SEC = appConstants.TOKEN_EXPIRATION_TIME * 60;



var genUsrToken = async function (user) {
  var options = { expiresIn: TOKEN_EXPIRATION_SEC };
  return jwt
    .signAsync(user,process.env.JWTSECRET, options)
    .then(function (jwtToken) {
      return jwtToken;
    })
    .catch(function (err) {
      console.log(err)
    });
};

async function generatePageExpiryToken(emailId,apiKey)
{
  const secretKey = process.env.PAGEEXPIRY;

// User information or any data you want to include in the token payload
const payload = {
   emailId,
   apiKey,
};

// Set the expiration time to 1 minute (60 seconds)
const expiresIn = '15m';

// Create the token
const token = jwt.sign(payload, secretKey, { expiresIn });

console.log('Generated Token:', token);
return token
}

function verifyPageToken(token) {
  if(!token || token==undefined)
  {
    console.log('no token or corrupt token')
    return responseMapping(appConstants.CODE.FRBDN,MESSAGE.InvalidCredentials)
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.PAGEEXPIRY, (err, decoded) => {
      if (err) {
        // Token verification failed
        console.log('invalid')
        reject(err);
        return responseMapping(appConstants.CODE.FRBDN,MESSAGE.InvalidCredentials)
      } else {
        // Token is valid
        console.log('valid page token')
        resolve(decoded);
        return responseMapping(appConstants.CODE.Success,MESSAGE.Success)
      }
    });
  });
}




module.exports = {
  genUsrToken,

  generatePageExpiryToken,

  verifyPageToken
};
