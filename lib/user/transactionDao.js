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

async function getAllTransactionsDataByDate(limit, skip, statusFilter) {
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

    getAllTransactionsData
}