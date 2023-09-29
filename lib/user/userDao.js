
const mongoose = require('mongoose')
let BaseDao = require('../dao/BaseDao')
const constants = require('../constants')

const User = require('../generic/models/userModel')

const usrDao = new BaseDao(User);




/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getUserDetails(query) {
    

    return usrDao.findOne(query)
}

/**
 * Create user
 * @param {Object} obj user details to be registered
 */
function createUser(obj) {

    let userObj = new User(obj)
    return usrDao.save(userObj)
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
    
    return usrDao.findOneAndUpdate(query, update, options)
}
async function updateWallet(query, updateDetails) {

    let update = {}
    update['$push'] = updateDetails

    let options = {
        new: true
    }
    
    
    return usrDao.findOneAndUpdate(query, {$push:{accounts:updateDetails}},{safe: true, upsert: true, new : true})
    
}

async function updateTransaction(query, updateDetails) {

    let update = {}
    update['$push'] = updateDetails

    let options = {
        new: true
    }
    
    
    return usrDao.findOneAndUpdate(query, {$push:{transactions:updateDetails}},{safe: true, upsert: true, new : true})
    
}

async function getAllWallets(details){
  const data = await usrDao.findOne(details)
  //console.log(data)
  return data
}

async function getAllTransactions(details){
    const data = await usrDao.findOne(details)
    //console.log(data)
    return data
  }
  async function getAllUsersTransactions(){
    const data = await usrDao.find()
    //console.log(data)
    return data
  }

  async function updateTransactionData(userId, transactionId, updateData)
  {
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = user.transactions.find(t => t.transactionId === transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update the transaction data
    Object.assign(transaction, updateData);

    // Save the updated user document
   const response = await user.save();
   return response
  }
  async function fetchTxDetail(userId, transactionId)
  {
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = user.transactions.find(t => t.transactionId === transactionId);
    console.log(transaction)
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update the transaction data
    console.log(transaction)
   return transaction
  }
function getWalletdetail(query){

    return usrDao.Find({
        $and: [
            { "_id": { $ne: `${query._id}` } },
          { "walletAddress":`${query.walletAddress}`} ,
          
        ]
      })
}



module.exports = {

 
    getUserDetails,

    createUser,

    updateWallet,
    
    updateProfile,
    
    getWalletdetail,

    getAllWallets,

    updateTransaction,

    getAllTransactions,

    getAllUsersTransactions,

    updateTransactionData,

    fetchTxDetail
    

}