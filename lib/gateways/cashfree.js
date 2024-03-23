const fetch = require("node-fetch")
async function cashfreepayouttest() {
  try {
    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': process.env.CF_CLIENT_ID,
        'x-client-secret': process.env.CF_CLIENT_SECRET
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
      amount: 30.00,  //Please paste here dynamic amount 
      transferId: 989898, //please provide here dynamic transfer id and it will be always unique
      transferMode: "upi",  //please provide here the transfermode
      beneDetails: {
        name: "Shubhanshu tripathi",  // please provide here the beneficiary details correctly
        email: "tshubhanshu007@gmail.com",
        phone: "+918318089088",
        vpa: "8318089088@YBL", // vpa should always be in capital and according to user details make it dynamic
        address1: "New delhi",
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

async function cashfreepayouttestbank() {
  try {
    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': process.env.CF_CLIENT_ID,
        'x-client-secret': process.env.CF_CLIENT_SECRET
      }
    };
    const authorization_response = await fetch(url, authorization_options)
    if (!authorization_response.ok) {
      throw new Error(`HTTP error! Status: ${authorization_response.status}`);
    }
    const authorization_data = await authorization_response.json();
    console.log(authorization_data)

    const token = "Bearer " + authorization_data.data.token

    const postData = {
      amount: 1,  //Please paste here dynamic amount 
      transferId: 67896688989806, //please provide here dynamic transfer id and it will be always unique
      transferMode: "banktransfer",  //please provide here the transfermode
      beneDetails: {
        name: "Tushant chakravarty",  // please provide here the beneficiary details correctly
        email: "tushant029@gmail.com",
        phone: "+919340079982", // vpa should always be in capital and according to user details make it dynamic
        bankAccount: "026291800001191",
        address1: "Kasia kushinagar" //provide any related address
      }
    }
    const postData2 = {
      amount: 30,
      transferId: "JUNOB2018142",
      transferMode: "banktransfer",
      remarks: "test",
      beneDetail: {
        bankAccount: "026291800001191",
        ifsc: "YESB0000262",
        name: "Ranjiths",
        email: "ranjiths@cashfree.com",
        phone: "9999999999",
        address1: "any_dummy_value"
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(postData2)
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
  cashfreepayouttestbank
}