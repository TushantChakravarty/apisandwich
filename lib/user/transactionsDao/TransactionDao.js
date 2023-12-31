const { Transaction, MainModel } = require('../../generic/models/TransactionData'); // Adjust the path accordingly


async function createTransaction(tx)
{
    const newTransaction = new Transaction(tx);
    
    // Save the transaction
    newTransaction.save()
        .then(transaction => {
            // Create a main document with a reference to the transaction
            // const mainDoc = new MainModel({
            //     transactions: [transaction._id]
            // });
    
            // // Save the main document
            // return mainDoc.save();
        })
        .then(mainDoc => {
            //console.log('Main document with reference to transaction saved:', mainDoc);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function getTransaction(txId) {
  try {
    const transaction = await Transaction.findOne({ transactionId: txId })
      .sort({ createdAt: -1 }); // Sort in descending order based on createdAt

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    console.log('Found transaction:', transaction);
    return transaction;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


async function getAllTransactions(skip, limit) {
    try {
      const result = await Transaction.aggregate([
        {
          $sort: { _id: -1 } // Assuming _id is a unique identifier
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ]);
  
      if (!result || result.length === 0) {
        throw new Error('No result found');
      }
      console.log(result)
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Propagate the error to the caller
    }
  }
  
module.exports={
    createTransaction,

    getTransaction,

    getAllTransactions
}