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



module.exports = {
    updateTransactionsData,

    updateTransactionStatus
}