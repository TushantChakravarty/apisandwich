const sendAirpayQrRequest =async (details)=>{
    console.log('check',details)
    const response = await fetch("https://kraken.airpay.co.in/airpay/api/generateOrder", {
        method: 'POST',
        
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
          'AuthKey':'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
                 },
        body: JSON.stringify(
            {
                encData: details.encryptedData,
                checksum: details.checksum,
                mid: "M294431"
            
        })
      })
         .then(resp => resp.json())
         .then(json =>{
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
    sendAirpayQrRequest
}