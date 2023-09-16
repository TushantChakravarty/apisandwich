const { createHash } = require('crypto');
const fetch = require("node-fetch");

 function hash() {
    let midCode = '30'
    let midSecret = '4d482c9d-68b9-4508-bf66-0214de04553f'
    let amount ='20.00'
    let vpa_address ='9340079982@paytm'
    let currency = 'inr'
    let newString = midCode + '~' + 'tushant' + '~' + '20323508372' + '~' + 'SBIN0007258'+ '~'+ amount+'~' + currency + '~' + 'sbi'+'~' + midSecret
    const hash = createHash('sha256');
    const bytes = hash.update(newString, 'utf8').digest('hex');
    
    let builder = '';
    for (let i = 0; i < bytes.length; i++) {
      builder += bytes[i]
    }
    
    return builder;
}
 function generatehash(Amount,accountNo,accountName,ifsc,bank) {
  let midCode = '30'
  let midSecret = '4d482c9d-68b9-4508-bf66-0214de04553f'
  let amount =`${Amount}`
  let account_number = `${accountNo}`
  let account_holder_name = `${accountName}`
  let IFSC = `${ifsc}`
  let bank_name = `${bank}`
  let vpa_address ='9340079982@paytm'
  let currency = 'inr'
  let newString = midCode + '~' + account_holder_name + '~' + account_number + '~' + IFSC+ '~'+ amount+'~' + currency + '~' + bank_name+'~' + midSecret
  const hash = createHash('sha256');
  const bytes = hash.update(newString, 'utf8').digest('hex');
  
  let builder = '';
  for (let i = 0; i < bytes.length; i++) {
    builder += bytes[i]
  }
  
  return builder;
}

 function generateDeposithash(amount,upiId) {
  let midCode = '30'
    let midSecret = '4d482c9d-68b9-4508-bf66-0214de04553f'
    //let amount ='300.00'
    let vpa_address ='9340079982@paytm'
    let currency = 'inr'
   // let newString = midCode + '~' + '8788' + '~' + '300.00'+'~' + 'inr' + '~' + midSecret
    let newString = midCode + '~' + amount + '~' + upiId+'~' + 'inr' + '~' + midSecret

    const hash = createHash('sha256');
    const bytes = hash.update(newString, 'utf8').digest('hex');
    
    let builder = '';
    for (let i = 0; i < bytes.length; i++) {
      builder += bytes[i]
    }
    
    return builder;
}

function generateDeposithashBank(amount,bankcode) {
  let midCode = '30'
    let midSecret = '4d482c9d-68b9-4508-bf66-0214de04553f'
    //let amount ='300.00'
    let vpa_address ='9340079982@paytm'
    let currency = 'inr'
   // let newString = midCode + '~' + '8788' + '~' + '300.00'+'~' + 'inr' + '~' + midSecret
    let newString = midCode + '~' + amount + '~' + bankcode+'~' + 'inr' + '~' + midSecret

    const hash = createHash('sha256');
    const bytes = hash.update(newString, 'utf8').digest('hex');
    
    let builder = '';
    for (let i = 0; i < bytes.length; i++) {
      builder += bytes[i]
    }
    
    return builder;
}

 const processTransaction =async  (amount,accountNo,accountName,ifsc,bank)=>{
  const Hash = generatehash(amount,accountNo,accountName,ifsc,bank)
  const merchantId = Math.floor(Math.random()*90000) + 10000;

  console.log(Hash)
 const response = await fetch('https://thingproxy.freeboard.io/fetch/https://sandboxwebapi.paygate10.com/api/process/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
    },
    body: JSON.stringify({
      "request_type": "withdrawal",
      "data": {
      "midcode": "30",
      "payby": "netbanking",
      "currency": "inr",
      "country": "in",
      "merchant_ref_no": `${merchantId}`,
      "notification_url": "string",
      "hash":`${Hash}`,
      "amount": `${amount}`,
      "account_holder_name": `${accountName}`,
      "account_number": `${accountNo}`,
      "bank_name": `${bank}`,
      "bank_code": `${ifsc}`,
      "bank_branch": "mumbai",
      "bank_address": "mumbai",
      "info": "string",
      "ipaddress": "103.176.136.52",
      "phone": "9340079982",
      "email": "na@gmail.com",
      "address": "",
      "account_type": "string",
      "document_id": "string",
      "document_type": "string",
      "custom_field_1": "string",
      "custom_field_2": "string",
      "custom_field_3": "string",
      "custom_field_4": "string",
      "custom_field_5": "string",
      }
      })  
  })
     .then(resp => resp.json())
     .then(json =>{
       console.log(json)
       if(json.success==true)
       return json
      return false
      })
     .catch((error)=>{
      console.log(error)
     })
  return response
}

const processTransactionTest =async  ()=>{
    const Hash = hash()
    const merchantId = Math.floor(Math.random()*90000) + 10000;
  
    console.log(Hash)
   const response = await fetch('https://thingproxy.freeboard.io/fetch/https://sandboxwebapi.paygate10.com/api/process/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
      },
      body: JSON.stringify({
        "request_type": "withdrawal",
        "data": {
        "midcode": "30",
        "payby": "netbanking",
        "currency": "inr",
        "country": "in",
        "merchant_ref_no": `${merchantId}`,
        "notification_url": "string",
        "hash":`${Hash}`,
        "amount": `20.00`,
        "account_holder_name": `tushant`,
        "account_number": `20323508372`,
        "bank_name": `sbi`,
        "bank_code": `SBIN0007258`,
        "bank_branch": "mumbai",
        "bank_address": "mumbai",
        "info": "string",
        "ipaddress": "103.176.136.52",
        "phone": "9340079982",
        "email": "na@gmail.com",
        "address": "",
        "account_type": "string",
        "document_id": "string",
        "document_type": "string",
        "custom_field_1": "string",
        "custom_field_2": "string",
        "custom_field_3": "string",
        "custom_field_4": "string",
        "custom_field_5": "string",
        }
        })  
    })
       .then(resp => resp.json())
       .then(json =>{
         console.log(json)
         if(json.success==true)
         return json
        return false
        })
       .catch((error)=>{
        console.log(error)
       })
    return response
  }
  const processTransactionTest2 =async  (data)=>{
    const Hash = generatehash(data.data.amount,data.data.account_number,data.data.account_holder_name,data.data.bank_code,data.data.bank_name)
    const merchantId = Math.floor(Math.random()*90000) + 10000;
  
    console.log(Hash)
    data.data.hash = Hash
    data.data.merchant_ref_no = merchantId
   const response = await fetch('https://sandboxwebapi.paygate10.com/api/process/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
      },
      body: JSON.stringify(data)  
    })
       .then(resp => resp.json())
       .then(json =>{
         console.log(json)
         if(json)
         return json
        return false
        })
       .catch((error)=>{
        console.log(error)
       })
    return response
  }
  const processPayinRequest =async  (data)=>{
    console.log(data.amount,data.vpa_address)
    const Hash = generateDeposithash(data.data.amount,data.data.vpa_address)
    const merchantId = Math.floor(Math.random()*90000) + 10000;
  
    console.log(Hash)
    data.data.hash = Hash
    data.data.merchant_ref_no = merchantId
   const response = await fetch('https://sandboxwebapi.paygate10.com/api/process/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
      },
      body: JSON.stringify(data)  
    })
       .then(resp => resp.json())
       .then(json =>{
         console.log(json)
         if(json)
         return json
        return false
        })
       .catch((error)=>{
        console.log(error)
       })
    return response
  }

  const processPayinRequestBank =async  (data)=>{
    console.log(data.amount,data.vpa_address)
    const Hash = generateDeposithashBank(data.data.amount,data.data.bank_code)
    const merchantId = Math.floor(Math.random()*90000) + 10000;
  
    console.log(Hash)
    data.data.hash = Hash
    data.data.merchant_ref_no = merchantId
   const response = await fetch('https://sandboxwebapi.paygate10.com/api/process/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
      },
      body: JSON.stringify(data)  
    })
       .then(resp => resp.json())
       .then(json =>{
         console.log(json)
         if(json)
         return json
        return false
        })
       .catch((error)=>{
        console.log(error)
       })
    return response
  }
  module.exports={
    processTransactionTest,
    processTransactionTest2,
    processPayinRequest,
    processPayinRequestBank
  }