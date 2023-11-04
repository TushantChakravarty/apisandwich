
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

function getMerchantDetails(query) {
    

  return usrDao.findOne(query)
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

async function updateGatewayDetails(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.last24hr': updateDetails.last24hr,
        'gateways.$.last24hrSuccess': updateDetails.last24hrSuccess,
        'gateways.$.totalVolume': updateDetails.totalVolume,
        'gateways.$.feeCollected24hr': updateDetails.feeCollected24hr,
        'gateways.$.successfulTransactions': updateDetails.successfulTransactions,
        'gateways.$.totalFeeCollected': updateDetails.totalFeeCollected
        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

}

async function updateGateway(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.last24hr': 0,
        'gateways.$.last24hrSuccess': 0,
        'gateways.$.yesterday': updateDetails.yesterday,
        'gateways.$.feeCollected24hr': 0,
        'gateways.$.feeCollected24hr': 0,
        'gateways.$.yesterdayFee': updateDetails.yesterdayFee,
        'gateways.$.yesterdayTransactions': updateDetails.yesterdayTransactions,
        'gateways.$.last24hrTotal': 0



        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

}

async function updateGatewayDetailsPayin(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.last24hrTotal': updateDetails.last24hrTotal,
        'gateways.$.totalTransactions': updateDetails.totalTransactions,
        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

}

async function updateGatewayCollectionFee(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.collectionFee': updateDetails.collectionFee,
        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

}

async function updateGatewayFees(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.collectionFee': updateDetails.collectionFee,
        'gateways.$.payoutFee': updateDetails.payoutFee,

        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

}

async function updateGatewayPayoutFee(gatewayName, updateDetails) {

  try {
    const filter = {
      'gateways.gatewayName': gatewayName
    };

    const update = {
      $set: {
        'gateways.$.payoutFee': updateDetails.payoutFee,
        // Add other fields to update here
      }
    };

    const options = {
      new: true
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log('Gateway not found or update failed.');
      return null;
    }
  } catch (error) {
    console.error('Error updating gateway details:', error);
    throw error; // You can handle the error as needed
  }

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
    // console.log(transactionId)
    // console.log('user',user)
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
  const getTransactionDetails = async  ( transactionId)=>{
    const user = await usrDao.find( {
      transactions: {
        $elemMatch: { transactionId: transactionId}
      }
    });
    //console.log(transactionId)
    //console.log('user',user)
    if (!user) {
      throw new Error('User not found');
    }
 
    // Find the transaction by its ID and update it
    const transaction = await user[0].transactions.find(t => t.transactionId === transactionId);
    // console.log(transaction)
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction
  }

  const getGatewayDetails = async (gatewayName)=>{
    const user = await adminDao.find( {
      gateways: {
        $elemMatch: { gatewayName: gatewayName}
      }
    });
    
    console.log('user',user)
    if (!user) {
      throw new Error('User not found');
    }
 
    // Find the transaction by its ID and update it
    const gateway = await user[0].gateways.find(t => t.gatewayName === gatewayName);
    // console.log(transaction)
    if (!gateway) {
      throw new Error('Transaction not found');
    }
    return gateway
  }
  async function updateSettlement(query, updateDetails) {

    let update = {}
    update['$push'] = updateDetails

    let options = {
        new: true
    }
    
    
    return usrDao.findOneAndUpdate(query, {$push:{settlements:updateDetails}},{safe: true, upsert: true, new : true})
    
}

async function updateGatewayData(query, updateDetails) {

  let update = {}
  update['$push'] = updateDetails

  let options = {
      new: true
  }
  
  
  return adminDao.findOneAndUpdate(query, {$push:{gateways:updateDetails}},{safe: true, upsert: true, new : true})
  
}
// function getWalletdetail(query){

//     return usrDao.Find({
//         $and: [
//             { "_id": { $ne: `${query._id}` } },
//           { "walletAddress":`${query.walletAddress}`} ,
          
//         ]
//       })
// }

async function getUserTransactionsData(details){
  let query = {
    emailId:details.emailId
  }
  const user = await usrDao.findOne(query)
  //console.log(data)
  console.log(details)
  if (!user) {
    return null; // User not found
}

const transactions = user.transactions.reverse()
    .slice(details.skip, details.skip + details.limit);

user.transactions = transactions;
let Transactions = transactions
return user;
  
}

async function getTransactionsByStatus(details){
  let query = {
    emailId:details.emailId
  }
  const user = await usrDao.findOne(query)
  //console.log(data)
  console.log(details)
  if (!user) {
    return null; // User not found
}

const transactions = user.transactions.reverse().filter(t => t.status === details.status);
const paginated = transactions.slice(details.skip, details.skip + details.limit);

// Now 'paginated' contains the transactions with the specified status and is paginated.
console.log(paginated);

// Return 'paginated' or do further processing as needed.
return paginated;
  
}
async function updateTransaction(query, updateDetails) {

  let update = {}
  update['$push'] = updateDetails

  let options = {
      new: true
  }
  
  
  return adminDao.findOneAndUpdate(query, {$push:{transactions:updateDetails}},{safe: true, upsert: true, new : true})
  
}


async function getTransactionByDate(userId, startDate, endDate) {
  const user = await usrDao.findOne(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Find the transaction by date and update it
  console.log('Input dates:', startDate, endDate);

  // Parse the input dates into Date objects
  const startParts = startDate.split('-');
  const endParts = endDate.split('-');

  if (startParts.length !== 3 || endParts.length !== 3) {
     new Error('Invalid date format');
  }

  // Debug: Check the parsed date parts
  console.log('Parsed date parts:', startParts, endParts);

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
  console.log('Parsed Date objects:', startDateTime, endDateTime);

  // Filter transactions within the date range
  const transactions = user.transactions.filter((t) => {
    const transactionDate = new Date(t.transaction_date);

    // Debug: Check the transaction date
    console.log('Transaction date:', transactionDate);

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

async function getAllTransactionByDate(startDate, endDate) {
  const Users = await usrDao.find();
  console.log('running here',Users)
  if (!Users) {
    throw new Error('User not found');
  }

  // Find the transaction by date and update it
  console.log('Input dates:', startDate, endDate);

  // Parse the input dates into Date objects
  const startParts = startDate.split('-');
  const endParts = endDate.split('-');

  if (startParts.length !== 3 || endParts.length !== 3) {
     new Error('Invalid date format');
  }

  // Debug: Check the parsed date parts
  console.log('Parsed date parts:', startParts, endParts);

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
  console.log('Parsed Date objects:', startDateTime, endDateTime);

  // Filter transactions within the date range
  const transactions = [];

// Create a map to convert hash values to gateway names
const hashToGateway = {
  'xyzAirpay': 'airpay',
  'xyzPaythrough': 'paythrough',
  'xyzbazorpay': 'bazarpay',
  // Add more mappings as needed
};

// Convert startDateTime and endDateTime to Date objects outside the loop

Users.forEach((user) => {
  const userTransactions = user.transactions.filter((t) => {
    const transactionDate = new Date(t.transaction_date);

    // Perform date comparison
    return transactionDate >= startDateTime && transactionDate <= endDateTime;
  });

  // Map and push the user's transactions to the main transactions array
  userTransactions.forEach((item) => {
    const gateway = hashToGateway[item.hash] || '';
    transactions.push({
      "transactionId": item.transactionId,
      "merchant_ref_no": item.merchant_ref_no,
      "amount": item.amount,
      "currency": item.curreny, // Fix the typo: 'currency' not 'curreny'
      "country": item.country,
      "status": item.status,
      "hash": item.hash,
      "payout_type": item.payout_type,
      "message": item.message,
      "transaction_date": item.transaction_date,
      "business_name": user.business_name,
      "gateway": gateway,
    });
  });
});

  if (transactions.length === 0) {
    throw new Error('No transactions found within the specified date range');
  }

  return transactions;
}

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

    getUser,

    getUserTransactionsData,

    getTransactionsByStatus,

    getTransactionByDate,

    getMerchantDetails,

    updateTransaction,

    getTransactionDetails,

    updateGatewayData,

    getGatewayDetails,

    updateGatewayDetails,

    updateGatewayCollectionFee,

    updateGatewayPayoutFee,

    updateGatewayFees,

    updateGatewayDetailsPayin,

    getAllTransactionByDate,
    
    updateGateway
    

}