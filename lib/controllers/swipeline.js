const crypto = require('crypto');
const axios = require('axios');
const sendSwipelineQrRequest = async (details) => {

console.log(details)
const response = await axios.post('https://merchant.swipelinc.com/paymentrequest/seamless', details, {
  headers: {
    'Content-Type': 'application/json',
  }
})
  .then(response => {
    // Handle the response data
    console.log('Response:', response.data);
    return response.data
  })
  .catch(error => {
    // Handle errors and log the entire error object for debugging
    console.error('Error:', error);
  });
  return response
  }

  function encryptData(plainText, encryptkey) {
    try {
      const encryptKey = Buffer.from(encryptkey, 'utf-8');

      // Your plaintext JSON object
      const plaintextObject = {
        key1: 'value1',
        key2: 'value2',
        // Add your JSON properties here
      };
      
      // Convert the JSON object to a string
      const plaintext = JSON.stringify(plainText);
      
      // Generate a random IV (Initialization Vector)
      const iv = crypto.randomBytes(16);
      
      // Create an AES cipher
      const cipher = crypto.createCipheriv('aes-256-cbc', encryptKey, iv);
      
      // Encrypt the data
      let encryptedData = cipher.update(plaintext, 'utf-8', 'base64');
      encryptedData += cipher.final('base64');
      
      // Combine IV and encrypted data
      const combinedBytes = Buffer.concat([iv, Buffer.from(encryptedData, 'base64')]);
      
      // Encode the combined data as Base64
      const base64Encoded = combinedBytes.toString('base64');
      
      //console.log(base64Encoded);
      return base64Encoded
    } catch (e) {
      console.error(`Exception in encrypt() : encryptData- ${encryptkey} : Message- ${e.message}`);
    }
    return null;
  }

  const swipeLineUpi = async (data)=>{
   
      const encryptedData = encryptData(data,data.enckey)
      console.log('my enc data',encryptedData)
      const details ={
        "mid":"SLCOS000019DELH",
        "payload":encryptedData    
        }
     const response =await sendSwipelineQrRequest(details)
     return response
  }

module.exports={
    sendSwipelineQrRequest,
    swipeLineUpi
}