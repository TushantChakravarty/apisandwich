const transactionsModel = require('../generic/models/transactionsModel');
const ObjectId = require('mongoose').Types.ObjectId


async function updateTransactionsData(updateData)
{
    const targetObjectId = '6575dfdd66f273055e681102';
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

module.exports = {
    updateTransactionsData
}