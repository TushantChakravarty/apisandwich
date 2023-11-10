
const mongoose = require('mongoose')
let BaseDao = require('../dao/BaseDao')
const constants = require('../constants')

const User = require('../generic/models/userModel');
const userModel = require('../generic/models/userModel');

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

async function updatePayouts(query, updateDetails) {

  let update = {}
  update['$push'] = updateDetails

  let options = {
      new: true
  }
  
  
  return usrDao.findOneAndUpdate(query, {$push:{payouts:updateDetails}},{safe: true, upsert: true, new : true})
  
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
  async function getAllUserTransactions(details){
    const data = await usrDao.findOne(details)
    //console.log(data)
    return data
  }

  async function getUserTransactionsData(details){
    let query = {
      emailId:details.emailId
    }
    const user = await usrDao.findOne(query)
    //console.log(data)
    //console.log(details)
    if (!user) {
      return null; // User not found
  }

  const transactions = user.transactions.reverse()
      .slice(details.skip, details.skip + details.limit);

  user.transactions = transactions;
  let Transactions = transactions
  return Transactions;
    
  }

  async function getTransactionsByStatus(details){
    let query = {
      emailId:details.emailId
    }
    const user = await usrDao.findOne(query)
    //console.log(data)
   // console.log(details)
    if (!user) {
      return null; // User not found
  }

  const transactions = user.transactions.filter(t => t.status === details.status);
const paginated = transactions.slice(details.skip, details.skip + details.limit);

// Now 'paginated' contains the transactions with the specified status and is paginated.
//console.log(paginated);

// Return 'paginated' or do further processing as needed.
return paginated;
    
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

  async function getTransactionByDate(userId, startDate, endDate) {
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    // Find the transaction by date and update it
    //console.log('Input dates:', startDate, endDate);

    // Parse the input dates into Date objects
    const startParts = startDate.split('-');
    const endParts = endDate.split('-');
  
    if (startParts.length !== 3 || endParts.length !== 3) {
       new Error('Invalid date format');
    }
  
    // Debug: Check the parsed date parts
    //console.log('Parsed date parts:', startParts, endParts);
  
    const startDateTime = new Date(
      Date.UTC(
        parseInt(startParts[0], 10),
        parseInt(startParts[1], 10) - 1,
        parseInt(startParts[2], 10),
        0,
        0,
        0,
        0
      )
    );
  
    const endDateTime = new Date(
      Date.UTC(
        parseInt(endParts[0], 10),
        parseInt(endParts[1], 10) - 1,
        parseInt(endParts[2], 10),
        23,
        59,
        59,
        999
      )
    );
  
    // Debug: Check the parsed Date objects
   // console.log('Parsed Date objects:', startDateTime, endDateTime);
  
    // Filter transactions within the date range
    const transactions = user.transactions.filter((t) => {
      const transactionDate = new Date(t.transaction_date);
  
      // Debug: Check the transaction date
     // console.log('Transaction date:', transactionDate);
  
      // Perform date comparison
      return (
        transactionDate >= startDateTime && transactionDate <= endDateTime
      );
    });
  
    if (transactions.length === 0) {
       new Error('No transactions found within the specified date range');
    }
  
    return transactions;
  }
  async function fetchTxDetail(userId, transactionId)
  {
    const user = await usrDao.findOne(userId);
    if (!user) {
       new Error('User not found');
    }

    // Find the transaction by its ID and update it
    const transaction = user.transactions.find(t => t.transactionId === transactionId);
    //console.log(transaction)
    if (!transaction) {
       new Error('Transaction not found');
    }

    // Update the transaction data
    //console.log(transaction)
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

async function getUser(details){
  const data = await usrDao.findOne(details)
  //console.log(data)
  return data
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

    fetchTxDetail,

    getAllUserTransactions,

    getUser,

    getUserTransactionsData,

    getTransactionByDate,

    getTransactionsByStatus,

    updatePayouts
    

}