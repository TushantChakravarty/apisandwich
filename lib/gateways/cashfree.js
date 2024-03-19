const fetch = require("node-fetch")
async function cashfreepayouttest() {
  try {
    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': '',
        'x-client-secret': ''
      }
    };
    const authorization_response = await fetch(url, authorization_options)
    if (!authorization_response.ok) {
      throw new Error(`HTTP error! Status: ${authorization_response.status}`);
    }
    const authorization_data = await authorization_response.json();
    console.log(authorization_data)

    const token = "Bearer " + authorization_data.data.token
    console.log("this is token", token)
    const postData = {
      amount: 1,  //Please paste here dynamic amount 
      transferId: 67896688989806, //please provide here dynamic transfer id and it will be always unique
      transferMode: "upi",  //please provide here the transfermode
      beneDetails: {
        name: "Tushant chakravarty",  // please provide here the beneficiary details correctly
        email: "tushant029@gmail.com",
        phone: "+919340079982",
        vpa: "9340079982@PAYTM", // vpa should always be in capital and according to user details make it dynamic
        address1: "Kasia kushinagar" //provide any related address
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(postData)
    };


    const response = await fetch("https://payout-gamma.cashfree.com/payout/v1/directTransfer", options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('POST request successful:', data);
  } catch (err) {
    console.log(err)
  }

}

module.exports = {
  cashfreepayouttest,
}