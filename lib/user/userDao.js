
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

async function getUserId(query) {
    const response = await usrDao.findOne({emailId:query})
  return String(response._id)
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
  async function getAllUserSettlements(details){
    const query = {
      emailId: details.emailId,
    };
    
    const data = await usrDao.findOne(query);
    // console.log(data);
    
    const { settlements } = data;
    
    // Pagination parameters
    // const page = details.skip; // the page you want to retrieve
    // const pageSize = details.limit; // the number of items per page
    
    // Calculate the starting index based on pagination parameters
    // const startIndex = (page ) * pageSize;
    
    // Use Array.slice() to get a portion of the settlements array
    const paginatedSettlements = settlements
    

    return paginatedSettlements
  }
  async function getAllUsersTransactions(){
    const data = await usrDao.find()
    //console.log(data)
    return data
  }

  async function getAllMerchantStats()
  {
    const merchantDetails = usrDao.aggregate([
      {
        $project: {
          _id: 0,
          business_name: '$business_name',
          emailId: '$emailId',
          todayVolume: { $toDouble: '$last24hr' },
          todayTransactions: { $toDouble: '$last24hrTotal' },
          yesterdayVolume: { $toDouble: '$yesterday' },
          yesterdayTransactions: { $toDouble: '$yesterdayTransactions' },
          walletBalance: { $toDouble: '$balance' },
          todayFee: { $toDouble: '$todayFee' },
          yesterdayFee: { $toDouble: '$yesterdayFee' }
        }
      }
    ]);
    
    // The result is an array of objects with the specified projection
    console.log(merchantDetails);
    
    return merchantDetails
  }

  async function getAllMerchantStats2()
  {
    const merchantDetails = usrDao.aggregate([
      {
        $project: {
          _id: 0,
          merchant_name: '$business_name', // Use the correct field name in your collection
          emailId: '$emailId',
          todaysVolume: { $toDouble: '$last24hr' }, // Convert to double if necessary
          todaysTransaction: { $toDouble: '$last24hrSuccess' }, // Convert to integer if necessary
          yesterdaysVolume: { $toDouble: '$yesterday' }, // Convert to integer if necessary
          balance: { $toDouble: '$balance' } // Convert to integer if necessary
        }
      }
    ]);
    
    // The result is an array of objects with the specified projection
    console.log(merchantDetails);
    
    return merchantDetails
  }

  async function getAllMerchantsData()
  {
    const users = usrDao.aggregate([
      {
        $project: {
          _id: 0,
          emailId: '$emailId',
          first_name: '$first_name',
          last_name: '$last_name',
          payinGateway: '$gateway',
          payoutGateway: '$payoutGateway',
          balance: '$balance',
          platformFee: '$platformFee',
          business_name: '$business_name',
          is_Banned: '$isBanned'
        }
      }
    ]);
    
    // The result is an array of objects with the specified projection
   // console.log(users);
    return users
  }

  async function getAllUsersTransactionsPaginated(skip, limit ) {
    try {
      const allUsers = await usrDao.find({}, { _id: 0 });
      
      // Extract all transactions from users
      const allTransactions = allUsers.reduce((transactions, user) => {
          if (user.transactions && Array.isArray(user.transactions)) {
              transactions.push(...user.transactions);
          }
          return transactions;
      }, []);

      // Ensure skip and limit values are within bounds
      const startIndex = Math.min(skip, allTransactions.length);
      const endIndex = Math.min(startIndex + limit, allTransactions.length);

      const paginatedTransactions = allTransactions.reverse().slice(startIndex, endIndex);

      return paginatedTransactions;
  } catch (error) {
      console.error("Error in getAllUsersTransactionsPaginated:", error);
      throw error;  // Propagate the error for handling at a higher level if needed
  }
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
  .slice(details.skip, details.skip + details.limit)
  .map(transaction => ({
    _id: transaction._id,
    transactionId: transaction.transactionId,
    merchant_ref_no: transaction.merchant_ref_no,
    amount: transaction.amount,
    currency: transaction.currency,
    country: transaction.country,
    status: transaction.status,
    payout_type: transaction.payout_type,
    message: transaction.message,
    transaction_date: transaction.transaction_date,
    phone: transaction.phone,
    username: transaction.username,
    utr: transaction.utr,
  }));
  console.log('tx',transactions)
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
  const paginated = transactions.slice(details.skip, details.skip + details.limit)
    .map(transaction => ({
      _id: transaction._id,
      transactionId: transaction.transactionId,
      merchant_ref_no: transaction.merchant_ref_no,
      amount: transaction.amount,
      currency: transaction.currency,
      country: transaction.country,
      status: transaction.status,
      payout_type: transaction.payout_type,
      message: transaction.message,
      transaction_date: transaction.transaction_date,
      phone: transaction.phone,
      username: transaction.username,
      utr: transaction.utr,
    }));

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

    const updated = transactions.map(transaction => ({
      _id: transaction._id,
      transactionId: transaction.transactionId,
      merchant_ref_no: transaction.merchant_ref_no,
      amount: transaction.amount,
      currency: transaction.currency,
      country: transaction.country,
      status: transaction.status,
      payout_type: transaction.payout_type,
      message: transaction.message,
      transaction_date: transaction.transaction_date,
      phone: transaction.phone,
      username: transaction.username,
      utr: transaction.utr,
    }));
  
    return updated;
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

async function getAllTransactionWithSuccessStatus(data, details) {
  let query = {
    emailId:data.emailId
  };
  console.log(details)
  const User = await usrDao.findOne(query);

  if (!User) {
    throw new Error('User not found');
  }

  const aggregatedTransactions = new Map();

  const userTransactions = User.transactions.reverse().filter((t) => {
    return t.status === 'success';
  });

  userTransactions.forEach((item) => {
    const date = new Date(item.transaction_date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).split(',')[0]; // Convert to IST

    if (!aggregatedTransactions.has(date)) {
      aggregatedTransactions.set(date, {
        date: item.transaction_date,
        volume: 0,
        transactionCount: 0
      });
    }

    const aggregatedData = aggregatedTransactions.get(date);
    aggregatedData.volume += item.amount;
    aggregatedData.transactionCount += 1;
  });

  const paginated = Array.from(aggregatedTransactions.values())
    .slice(details.skip, details.skip + details.limit);

  if (paginated.length === 0) {
    console.log('No transactions found with the specified status');
  }

  return paginated;
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

    updatePayouts,

    getAllUserSettlements,

    getAllTransactionWithSuccessStatus,

    getAllUsersTransactionsPaginated,

    getAllMerchantsData,

    getAllMerchantStats,

    getAllMerchantStats2,

    getUserId
    

}