let BaseDao = require("../dao/BaseDao");
const constants = require("../constants");
const user = require("../generic/models/userModel");
const usrDao = new BaseDao(user);

async function getAllMerchantsData() {
  const users = usrDao.aggregate([
    {
      $project: {
        _id: 0,
        emailId:"$emailId",
        apiKey:"$apiKey",
        businessName: "$business_name", // Use the correct field name in your collection
      },
    },
  ]);

  // Extract the merchant names from the result
 
  return users;
}

module.exports ={
    getAllMerchantsData
}