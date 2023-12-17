/*#################################            Load modules start            ########################################### */
const adminDao = require("../user/adminDao");
const usrConst = require("../user/userConstants");
const mapper = require("../user/userMapper");
const dao = require("./supportDao")

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
    getAllMerchants
}
