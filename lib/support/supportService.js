/*#################################            Load modules start            ########################################### */
const adminDao = require("../user/adminDao");
const usrConst = require("../user/userConstants");
const mapper = require("../user/userMapper");
const dao = require("./supportDao")
const appUtil = require('../appUtils')

async function validateRequest(details) {
  let query = {
    emailId: details.emailId,
  };
  return adminDao.getUserDetails(query).then(async (userExists) => {
    if (userExists) {
      if (details.apiKey == userExists.apiKey) {
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

function addAgent(details) {
  if (!details || Object.keys(details).length == 0) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    return validateRequest(details).then((response) => {
      if (response == true) {
        if (details.emailId) {
          let query = {
            emailId: details.email_Id,
          };
    
          return dao
            .getAgentDetails(query)
            .then(async (userExists) => {
              if (userExists) {
                return mapper.responseMapping(
                  usrConst.CODE.BadRequest,
                  usrConst.MESSAGE.EmailAlreadyExists
                );
              } else {
               
                let password = details.password
                let convertedPass = await appUtil.convertPass(password);
                details.password = convertedPass;
                const apiKey = Math.random().toString(36).slice(2);
                console.log(apiKey);
    
                details.apiKey = apiKey;
                details.emailId = details.email_Id
                details.isVerified = false
    
                /*   let mailSent = Email.sendMessage( details.emailId)
                           console.log({ mailSent })*/
    
                return dao
                  .createUser(details)
                  .then((userCreated) => {
                    if (userCreated) {
                      //             const EmailTemplate=Template.register(details.OTP)
                      // //console.log(isExist.emailId)
                      //            let mailSent = Email.sendMessage2(details.emailId,EmailTemplate)
                      //             console.log(mailSent)
                      // let filteredUserResponseFields = mapper.filteredUserResponseFields(userCreated)
                      let responseData = {
                        email: userCreated[0].emailId,
                        password: password,
                        apiKey: userCreated[0].apiKey,
                      };
                      console.log(responseData);
                      return mapper.responseMappingWithData(
                        usrConst.CODE.Success,
                        usrConst.MESSAGE.Success,
                        responseData
                      );
                    } else {
                      console.log("Failed to save user");
                      return mapper.responseMapping(
                        usrConst.CODE.INTRNLSRVR,
                        usrConst.MESSAGE.internalServerError
                      );
                    }
                  })
                  .catch((err) => {
                    console.log({ err });
                    return mapper.responseMapping(
                      usrConst.CODE.INTRNLSRVR,
                      usrConst.MESSAGE.internalServerError
                    );
                  });
              }
            })
            .catch((err) => {
              console.log({ err });
              return mapper.responseMapping(
                usrConst.CODE.INTRNLSRVR,
                usrConst.MESSAGE.internalServerError
              );
            });
        }
      }
     else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
    })
   
  }
}

async function verifyAgent(details) {
  return validateRequest(details)
      .then((response) => {
          if (response == true) {
              const query = {
                  emailId: details.email_Id
              }

              const updateObj ={
                isVerified:details.isVerified
              }

              return dao.updateProfile(query,updateObj).then((userUpdated) => {
                  if (userUpdated) {
                      // console.log('success', userUpdated)

                      return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'updated')


                  } else {

                      console.log("Failed to update ")
                      return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                  }
              })
          }
          else if (response == false) {
              return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
          } else {
              return mapper.responseMapping(usrConst.CODE.BadRequest, response)
          }
      })
}

async function getAllMerchants(details) {
    return validateRequest(details).then((response) => {
      if (response == true) {
        return dao
          .getAllMerchantsData()
          .then((merchants) => {
            if (merchants) {
              //console.log('success', updated)
  
              return mapper.responseMappingWithData(
                usrConst.CODE.Success,
                usrConst.MESSAGE.Success,
                merchants
              );
            } else {
              console.log("Failed to get data");
              return mapper.responseMapping(
                usrConst.CODE.INTRNLSRVR,
                usrConst.MESSAGE.internalServerError
              );
            }
          });
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return mapper.responseMapping(usrConst.CODE.BadRequest, response);
      }
    });
  }

module.exports ={
    getAllMerchants,

    addAgent,

    verifyAgent
}
