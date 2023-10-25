const fetch = require("node-fetch");

async function pinwalletPayin (details){
    const referenceId = Math.floor(Math.random() * 1000000000);
   console.log(referenceId)
    const response = await fetch('https://app.pinwallet.in/api/DyupiV2/V4/GenerateUPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
          'AuthKey':'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
          'IPAddress':'103.176.136.226',
          Authentication: 'Bearer {eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTkwMDA4NjYzIiwibmFtZWlkIjoiMTQ3IiwiZW1haWwiOiJpbmZvQHdlcm5lci5hc2lhIiwianRpIjoiOTM0ODIyYzktNjk0Ny00MTJhLWE2ZTgtZmRmYzNiMzdkYjMyIiwiZXhwIjoxNjk1ODIyMjgzLCJpc3MiOiJFenVsaXhiMmIiLCJhdWQiOiJFenVsaXhiMmIifQ.VdcZVGxitNcqJ_sjWMGQ2uU7P24HIVQkAi_TjyFD9zM}'
        },
        body: JSON.stringify({
            "Name":details.username,
            "ReferenceId":referenceId,
            "Email":details.emailId,
            "Phone":details.phone,
            "amount":details.amount 
          })  
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

async function pinwalletPayout (details){
  const referenceId = Math.floor(Math.random() * 1000000000);
 console.log(referenceId)
  const response = await fetch('https://app.pinwallet.in/api/payout/dotransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
        'AuthKey':'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
        'IPAddress':'171.49.142.114',
        Authentication: 'Bearer {eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTkwMDA4NjYzIiwibmFtZWlkIjoiMTQ3IiwiZW1haWwiOiJpbmZvQHdlcm5lci5hc2lhIiwianRpIjoiYjg5ODgyMjAtODI5MS00NDNiLTk5MWItMzhlYmFhOTg2YmM4IiwiZXhwIjoxNjk4MjU0NDExLCJpc3MiOiJFenVsaXhiMmIiLCJhdWQiOiJFenVsaXhiMmIifQ.cBqd5EfG9eE7gutfoBlEeOuIymnobifFf1Mbb3owDGk}'
      },
      body: JSON.stringify({
        "BenificiaryAccount":"20323508372",
        "BenificiaryIfsc":"SBIN0007258",
        "BenificiaryName":"tushant",
        "amount":100,
        "TransactionId":"987887664",
        "Latitude":"21.00",
        "Longitude":"81.55"
        })  
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
    pinwalletPayin,
    pinwalletPayout
}