const moment = require('moment-timezone');
const transactionsModel = require('../generic/models/transactionsModel');
let BaseDao = require("../dao/BaseDao");
const ObjectId = require('mongoose').Types.ObjectId
const transactionDao = new BaseDao(transactionsModel);


async function updateTransactionsData(updateData)
{
    const targetObjectId = '6575f177435fd406e1991f05';
    const filter = { _id: ObjectId(targetObjectId) };
    
// Update the document by pushing the single transaction data
transactionsModel.updateOne(
    filter,
    { $push: { transactions: updateData } },
    function(err, result) {
        if (err) {
            console.error('Error updating document:', err);
        } else {
            console.log('Document updated successfully');
        }

        
    }
);
}

async function updateTransactionStatus(transactionId, updateData) {

   
    const targetObjectId = '6575f177435fd406e1991f05';
    const filter = {
        _id: ObjectId(targetObjectId),
        'transactions.transactionId': transactionId,
      };
      
      const update = {
        $set: {
          'transactions.$.status': updateData.status,
          'transactions.$.utr': updateData.utr,
          // Add other fields you want to update
        },
      };
    
      const result = await transactionDao.updateOne(filter, update);
    
      if (result.modifiedCount > 0) {
        console.log('Document updated successfully');
      } else {
        console.log('No document matched the criteria');
      }
}

async function getAllTransactions(skip,limit) {


  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId('6575f177435fd406e1991f05') }
    },
    {
      $project: {
        reversedTransactions: { $reverseArray: "$transactions" }
      }
    },
    {
      $project: {
        paginatedTransactions: { $slice: ["$reversedTransactions", skip, limit] }
      }
    }
  ]);
  
  // Access the reversed and paginated transactions
  const reversedTransactions = result[0].reversedTransactions;
  const paginatedTransactions = result[0].paginatedTransactions;
  
  return paginatedTransactions;
}

async function getAllTransactionsData(limit, skip, statusFilter) {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId('6575f177435fd406e1991f05') }
    },
    {
      $project: {
        reversedTransactions: { $reverseArray: "$transactions" }
      }
    },
    {
      $project: {
        filteredTransactions: {
          $filter: {
            input: "$reversedTransactions",
            as: "transaction",
            cond: { $eq: ["$$transaction.status", statusFilter] }
          }
        }
      }
    },
    {
      $project: {
        paginatedTransactions: { $slice: ["$filteredTransactions", skip, limit] }
      }
    }
  ]);

  // Access the paginated transactions directly
  const paginatedTransactions = result[0].paginatedTransactions;

  return paginatedTransactions;
}


async function getTotalVolume(statusFilter) {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId('6575f177435fd406e1991f05') }
    },
    {
      $unwind: "$transactions"
    },
    {
      $match: { "transactions.status": statusFilter }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: "$transactions.amount" }
      }
    }
  ]);

  // Access the total volume directly
  const totalVolume = result[0] ? result[0].totalVolume : 0;

  return totalVolume;
}

async function getDataById(id) {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId('6575f177435fd406e1991f05') }
    },
    {
      $unwind: "$transactions"
    },
    {
      $match: {
        $or: [
          { "transactions.transactionId": id },
          { "transactions.utr": id }
        ]
      }
    },
    {
      $group: {
        _id: null,
        transaction: { $first: "$transactions" } // Use $first to get the first matching transaction
      }
    }
  ]);

  // Access the matching transaction directly
  const matchingTransaction = result[0] ? result[0].transaction : null;

  return matchingTransaction;
}

async function getTransactionById(id) {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId('6575f177435fd406e1991f05') }
    },
    {
      $unwind: "$transactions"
    },
    {
      $match: {
        $or: [
          { "transactions.transactionId": id }
        ]
      }
    },
    {
      $group: {
        _id: null,
        transaction: { $first: "$transactions" } // Use $first to get the first matching transaction
      }
    }
  ]);

  // Access the matching transaction directly
  const matchingTransaction = result[0] ? result[0].transaction : null;

  return matchingTransaction;
}








async function getAllMerchantTransactions() {
  const indianTimeZone = 'Asia/Kolkata';

  
  const result = await transactionDao.findOne({ _id: ObjectId('6575f177435fd406e1991f05') });

  

  return result.transactions;
}




async function getTotalVolumeByGatewayAndStatus(status, gateway) {
  if(gateway=='paythrough')
  {

    const result = await transactionDao.aggregate([
      {
        $match: { _id: ObjectId('6575f177435fd406e1991f05') }
      },
      {
        $unwind: "$transactions"
      },
      {
        $match: {
          $and: [
            { "transactions.status": status },
            { "transactions.gateway": { $in: ["paythrough", "paythroughIntent"] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$transactions.amount" }
        }
      }
    ]);
    
    // Access the total volume directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;

    return totalVolume;
  }else{
    const result = await transactionDao.aggregate([
      {
        $match: { _id: ObjectId('6575f177435fd406e1991f05') }
      },
      {
        $unwind: "$transactions"
      },
      {
        $match: {
          $and: [
            { "transactions.status": status },
            { "transactions.gateway":gateway }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$transactions.amount" }
        }
      }
    ]);
  
    // Access the matching transaction directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
  
    return totalVolume
  }
  }


 
/*
// transactionsModel.create({ transactions: reversed.reverse() }, function(err, result) {
                //     if (err) {
                //         console.error('Error inserting data:', err);
                //     } else {
                //         console.log('Data inserted successfully:', result);
                //     }
                
                //     // Close the connection after insertion
                // });
                //updateTransactionsData(reversed[0])
*/

module.exports = {
    updateTransactionsData,

    updateTransactionStatus,

    getAllTransactions,

    getAllTransactionsData,

    getAllMerchantTransactions,

    getTotalVolume,

    getDataById,

    getTransactionById,

    getTotalVolumeByGatewayAndStatus
}