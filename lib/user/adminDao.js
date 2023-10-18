
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

function updateUserProfile(query, updateDetails) {

    let update = {}
    update['$set'] = updateDetails

    let options = {
        new: true
    }
    
    return usrDao.findOneAndUpdate(query, update, options)
}

function updateUserGateway(query, updateDetails) {

  let update = {}
  update['$set'] = updateDetails

  let options = {
      new: true
  }
  
  return usrDao.findOneAndUpdate(query, update, options)
}



function updateUserProfile2(details, updateDetails) {

  const filter = {
    transactions: {
      $elemMatch: { transactionId: details.transactionId }
    }
  };
    let update = {}
    update['$set'] = updateDetails

    let options = {
        new: true
    }
    
    return usrDao.findOneAndUpdate(filter, update, options)
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

  async function getUser(details){
    const data = await usrDao.findOne(details)
    //console.log(data)
    return data
  }

  async function getAllUserTransactions(details){
    const data = await usrDao.findOne(details)
    //console.log(data)
    return data
  }
  async function getUserBalance(details){
    const data = await usrDao.findOne(details)
    //console.log(data)
    return data
  }
  async function getUserBalance2(details){
    const data = await usrDao.find({
      transactions: {
        $elemMatch: { transactionId: details.transactionId}
      }
    })
    //console.log(data)
    return data
  }
  async function getAllUsersTransactions(){
    const data = await usrDao.find()
    //console.log(data)
    return data
  }
  async function fetchTxDetail()
  {
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = user.transactions.find(t => t.transactionId.toString() === transactionId.toString());
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update the transaction data
    console.log(transaction)
   return transaction
  }
  async function updateTransactionData(userId, transactionId, updateData)
  {
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = user.transactions.find(t => t.transactionId.toString() === transactionId.toString());
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update the transaction data
    Object.assign(transaction, updateData);

    // Save the updated user document
   const response = await user.save();
   return response
  }
  async function updateTransactions(userId, transactionId, updateData)
  {
    const user = await usrDao.find( {
      transactions: {
        $elemMatch: { transactionId: transactionId}
      }
    });
    console.log(transactionId)
    console.log('user',user)
    if (!user) {
      throw new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = await user[0].transactions.find(t => t.transactionId === transactionId);
    // console.log(transaction)
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update the transaction data
    Object.assign(transaction, updateData);

    // Save the updated user document
   const response = await user[0].save();
   return response
  }
  async function updateSettlement(query, updateDetails) {

    let update = {}
    update['$push'] = updateDetails

    let options = {
        new: true
    }
    
    
    return usrDao.findOneAndUpdate(query, {$push:{settlements:updateDetails}},{safe: true, upsert: true, new : true})
    
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

    getAllUsersTransactions,

    updateUserProfile,

    getUserBalance,

    updateTransactionData,

    updateUserProfile2,

    updateTransactions,

    getUserBalance2,

    updateUserGateway,

    getAllUserTransactions,

    updateSettlement,

    getUser
    

}