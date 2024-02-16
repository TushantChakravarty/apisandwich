const fetch = require("node-fetch");

async function paytmePayin (details){
    const referenceId = Math.floor(Math.random() * 1000000000);
   console.log(referenceId)
    const response = await fetch('https://apis.paytme.com/v1/merchant/payin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
         'x-api-key':"188944e683bd2b4b01229449f27ee8c5"
         // 'IPAddress':'103.176.136.226',
         // Authentication: 'Bearer {eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OTkwMDA4NjYzIiwibmFtZWlkIjoiMTQ3IiwiZW1haWwiOiJpbmZvQHdlcm5lci5hc2lhIiwianRpIjoiOTM0ODIyYzktNjk0Ny00MTJhLWE2ZTgtZmRmYzNiMzdkYjMyIiwiZXhwIjoxNjk1ODIyMjgzLCJpc3MiOiJFenVsaXhiMmIiLCJhdWQiOiJFenVsaXhiMmIifQ.VdcZVGxitNcqJ_sjWMGQ2uU7P24HIVQkAi_TjyFD9zM}'
        },
        body: JSON.stringify({
            
                "userContactNumber":details?.phone,
                "merchantTransactionId":referenceId?.toString(),
                "amount":details?.amount,
                "name":details?.username,
                "email":details?.customerEmail
            
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

async function paytmePaymentQr(details,createTransaction,mapper,userData,gateway,uuid,usrConst){
    const response = await paytmePayin(details);
    if (response.code == 200) {
      const timeElapsed = Date.now();

      // const gatewayData = await adminDao.getGatewayDetails(
      //   "paythrough"
      // );
      // const gatewayUpdate = {
      //   last24hrTotal: gatewayData.last24hrTotal + 1,
      //   totalTransactions: gatewayData.totalTransactions + 1,
      // };
      // console.log('gatewayData', gatewayUpdate)
      const today = new Date(timeElapsed);
     
      const updateDetails = {
        transactionId: response?.data?.transaction_id,
        merchant_ref_no: response?.data?.transaction_id,
        amount: details.amount,
        currency: "inr",
        country: "in",
        status: "IN-PROCESS",
        hash: "xyzAirpay",
        payout_type: "PAYIN",
        message: "IN-PROCESS",
        transaction_date: today.toISOString(),
        gateway: gateway,
        phone: details.phone ? details.phone : "",
        username: details.username ? details.username : "",
        upiId: details.upiId ? details.upiId : "",
        customer_email: details.customer_email,
        business_name: userData.business_name,
        uuid:String(uuid)
      };

      //adminDao.updateGatewayDetailsPayin("airpay", gatewayUpdate);
      //let newData = updateDetails;
      //newData.uuid = String(uuid);
      createTransaction(updateDetails);
     
      return mapper.responseMappingWithData(
        usrConst.CODE.Success,
        usrConst.MESSAGE.Success,
        {
          //url: url,
          url:response?.data?.upiurl,
         // upiUrl: JSON.parse(response).QRCODE_STRING,
          transaction_id: response?.data?.transaction_id,
        }
      );
    } else {
      return mapper.responseMappingWithData(
        usrConst.CODE.INTRNLSRVR,
        usrConst.MESSAGE.internalServerError,
        response
      );
    }
}

async function paytmePaymentPage(details,createTransaction,mapper,userData,gateway,uuid,usrConst,jwtHandler,redirectUrl){
    const response = await paytmePayin(details);
    if (response.code == 200) {
      const timeElapsed = Date.now();

      // const gatewayData = await adminDao.getGatewayDetails(
      //   "paythrough"
      // );
      // const gatewayUpdate = {
      //   last24hrTotal: gatewayData.last24hrTotal + 1,
      //   totalTransactions: gatewayData.totalTransactions + 1,
      // };
      // console.log('gatewayData', gatewayUpdate)
      const today = new Date(timeElapsed);
     
      const updateDetails = {
        transactionId: response?.data?.transaction_id,
        merchant_ref_no: response?.data?.transaction_id,
        amount: details.amount,
        currency: "inr",
        country: "in",
        status: "IN-PROCESS",
        hash: "xyzAirpay",
        payout_type: "PAYIN",
        message: "IN-PROCESS",
        transaction_date: today.toISOString(),
        gateway: gateway,
        phone: details.phone ? details.phone : "",
        username: details.username ? details.username : "",
        upiId: details.upiId ? details.upiId : "",
        customer_email: details.customer_email,
        business_name: userData.business_name,
        uuid:String(uuid)
      };

      //adminDao.updateGatewayDetailsPayin("airpay", gatewayUpdate);
      //let newData = updateDetails;
      //newData.uuid = String(uuid);
      createTransaction(updateDetails);
     
      const urls = {
        gpayurl: response.data.gpayurl,
        paytmurl: response.data.paytmurl,
        phonepeurl: response.data.phonepeurl,
        upiurl: response.data.upiurl,
      };
      const gpayurl = encodeURIComponent(urls.gpayurl);
      const phonepeurl = encodeURIComponent(urls.phonepeurl);
      const paytmurl = encodeURIComponent(urls.paytmurl);
      const upiurl = encodeURIComponent(urls.upiurl);
      const token = await jwtHandler.generatePageExpiryToken(
        details.emailId,
        details.apiKey
      );
      const username = details.username.replace(/\s/g, "");

      let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${username}&txid=${response.data.transaction_id}&gateway=payhubPE&gpay=${gpayurl}&phonepe=${phonepeurl}&paytm=${paytmurl}&upi=${upiurl}&token=${token}`;
      if (redirectUrl) {
        url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${username}&txid=${response.data.transaction_id}&gateway=payhubPE&url=${redirectUrl}&gpay=${gpayurl}&phonepe=${phonepeurl}&paytm=${paytmurl}&upi=${upiurl}&token=${token}`;
      }
     // adminDao.updateGatewayDetailsPayin("bazarpay", gatewayUpdate);

      //dao.updateTransaction(query, updateDetails);
      return mapper.responseMappingWithData(
        usrConst.CODE.Success,
        usrConst.MESSAGE.Success,
        {
          url: url,
         //url:resp.success.upiurl,
          //upiUrl: urls.upiurl,
          transaction_id: response.data.transaction_id,
        }
      );
    } else {
      return mapper.responseMappingWithData(
        usrConst.CODE.INTRNLSRVR,
        usrConst.MESSAGE.internalServerError,
        response
      );
    }
}

module.exports={
    paytmePayin,

    paytmePaymentQr,

    paytmePaymentPage
}