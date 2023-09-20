
const mongoose = require('mongoose')
let BaseDao = require('../dao/BaseDao')
const constants = require('../constants')

const Admin = require('../generic/models/adminModel')
const user =  require('../generic/models/userModel')
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user)



/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getUserDetails(query) {
    

    return adminDao.findOne(query)
}

/**
 * Create user
 * @param {Object} obj user details to be registered
 */
function createUser(obj) {

    let userObj = new Admin(obj)
    return adminDao.save(userObj)
}




/**
 * Update user profile
 * @param {Object} query mongo query to find user to update
 * @param {Object} updateDetails details to be updated
 */
function updateProfile(query, updateDetails) {

    let update = {}
    update['$set'] = updateDetails

    let options = {
        new: true
    }
    
    return adminDao.findOneAndUpdate(query, update, options)
}
// async function updateWallet(query, updateDetails) {

//     let update = {}
//     update['$push'] = updateDetails

//     let options = {
//         new: true
//     }
    
    
//     return usrDao.findOneAndUpdate(query, {$push:{accounts:updateDetails}},{safe: true, upsert: true, new : true})
    
// }

// async function updateTransaction(query, updateDetails) {

//     let update = {}
//     update['$push'] = updateDetails

//     let options = {
//         new: true
//     }
    
    
//     return usrDao.findOneAndUpdate(query, {$push:{transactions:updateDetails}},{safe: true, upsert: true, new : true})
    
// }

// async function getAllWallets(details){
//   const data = await usrDao.findOne(details)
//   //console.log(data)
//   return data
// }

async function getAllTransactions(details){
    const data = await adminDao.findOne(details)
    //console.log(data)
    return data
  }
  async function getAllUsersTransactions(){
    const data = await usrDao.find()
    //console.log(data)
    return data
  }

// function getWalletdetail(query){

//     return usrDao.Find({
//         $and: [
//             { "_id": { $ne: `${query._id}` } },
//           { "walletAddress":`${query.walletAddress}`} ,
          
//         ]
//       })
// }



module.exports = {

 
    getUserDetails,

    createUser,

    // updateWallet,
    
    updateProfile,
    
    // getWalletdetail,

    // getAllWallets,

    // updateTransaction,

    getAllTransactions,

    getAllUsersTransactions
    

}