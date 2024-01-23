const dao = require('./userPayoutsDao')
const usrConst = require('../../userConstants')
const mapper = require('../../userMapper');
const appUtils = require('../../../appUtils');

const usrDao = require('../../userDao')
async function validateRequest(details) {
    let query = {
      emailId: details.emailId,
    };
    return usrDao.getUserDetails(query).then(async (userExists) => {
      if (userExists) {
        const decryptedKey = appUtils.decryptText(details.apiKey);
        console.log("validate decrypted key", decryptedKey);
        if (decryptedKey == userExists.apiKey) {
          return true;
        } else {
          return false;
        }
      } else {
        return mapper.responseMapping(
          usrConst.CODE.BadRequest,
          "User does not exist"
        );
      }
    });
  }

  async function getPayoutBalance(details) {
    // console.log(details)
    if(details)
    {
   return validateRequest(details)
   .then((response)=>{
     if(response==true)
     {
         let query ={
             emailId:details.emailId
         }
         return dao.getAdminDetails(query)
         .then((userDetails)=>{
 
             if(userDetails)
             {
                 console.log(userDetails)
                 return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, {
                     balance:userDetails.payoutsBalance
                 })
                 
             }else{
                 return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                 
             }
         })
     }  else if (response == false) {
         return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
       } else {
         return response;
       }
     
   })
 } else {
     return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
   }
     
 }
 
 async function getMerchantPayoutData(details) {
     // console.log(details)
     if(details&&details?.emailId)
     {
    return validateRequest(details)
    .then((response)=>{
      if(response==true)
      {
          let query ={
              emailId:details.emailId
          }
          return usrDao.getUserDetails(query)
          .then((userDetails)=>{
  
              if(userDetails)
              {
                  console.log(userDetails)
                  let response ={
                     last24hr:userDetails.payoutsData.last24hr,
                     yesterday:userDetails.payoutsData.yesterday,
                     successRate:0,
                     last24hrSuccess:userDetails.payoutsData.last24hrSuccess,
 
                  }
                  return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
                  
              }else{
                  return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                  
              }
          })
      }  else if (response == false) {
          return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
        } else {
          return response;
        }
      
    })
  } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
    }
      
  }

  async function getAllMerchantPayouts(details) {
    // console.log(details)
    if(details&&details?.emailId&&details?.limit&&details?.skip>=0)
    {
   return validateRequest(details)
   .then((response)=>{
     if(response==true)
     {
         let query ={
             emailId:details.emailId,
             limit:details?.limit,
             skip:details?.skip
         }
         return dao.getAllMerchantPayouts(query)
         .then((transactions)=>{
 
             if(transactions)
             {
                
                 return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, transactions)
                 
             }else{
                 return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                 
             }
         })
     }  else if (response == false) {
         return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
       } else {
         return response;
       }
     
   })
 } else {
     return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
   }
     
 }
 
  module.exports={
    getMerchantPayoutData,

    getAllMerchantPayouts
  }