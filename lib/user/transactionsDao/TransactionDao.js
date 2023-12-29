const { Transaction, MainModel } = require('../../generic/models/TransactionData'); // Adjust the path accordingly


async function createTransaction(tx)
{
    const newTransaction = new Transaction(tx);
    
    // Save the transaction
    newTransaction.save()
        .then(transaction => {
            // Create a main document with a reference to the transaction
            const mainDoc = new MainModel({
                transactions: [transaction._id]
            });
    
            // Save the main document
            return mainDoc.save();
        })
        .then(mainDoc => {
            //console.log('Main document with reference to transaction saved:', mainDoc);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function getTransaction(txId)
{
    Transaction.findOne({ transactionId: txId })
    .then(transaction => {
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Now, find the main document that references this transaction
        return MainModel.findOne({ transactions: transaction._id }).populate('transactions');
    })
    .then(mainDoc => {
        if (!mainDoc) {
            throw new Error('Main document not found');
        }

        console.log('Main document with related transactions:', mainDoc.transactions[0]);

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

module.exports={
    createTransaction,

    getTransaction
}