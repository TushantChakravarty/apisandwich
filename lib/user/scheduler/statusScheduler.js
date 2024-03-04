const { encryptParameters } = require("../../appUtils");
const { getAllPendinTransactionsPaythrough, fetchPaythroughStatus } = require("../../gateways/paythrough");
const { updateTransactionStatus } = require("../transactionDao");
const { getUserDetails } = require("../userDao");
const moment = require('moment-timezone');

const ObjectId = require("mongoose").Types.ObjectId;

function isOlderThan45MinutesIST(dateString) {
    
    // Given date
    const givenDate = moment(dateString);

    // Convert given date to IST timezone
    const givenDateIST = givenDate.tz('Asia/Kolkata');

    // Get current time in IST
    const currentTimeIST = moment().tz('Asia/Kolkata');

    // Calculate time difference in minutes
    const timeDifferenceMinutes = currentTimeIST.diff(givenDateIST, 'minutes');

    // Check if the time difference is greater than 45 minutes
    return timeDifferenceMinutes > 45;
}

// Example usage


async function updatePendingTransactionStatus()
{
    try{

        const paythrough = await getAllPendinTransactionsPaythrough()
        console.log(paythrough.length)
        if(paythrough)
        {
            paythrough.map(async (item,index)=>{
                // let query = {
                //     _id:ObjectId(item?.uuid)
                // }
                // const user = await getUserDetails(query)
                // console.log('user',user?.callbackUrl)
                if(item&&index<100)
                {

                    const response = await fetchPaythroughStatus(item)
                    .catch((e)=>{
                        console.log(e)
                    })
                    if(response&&(response?.current_status=='success'||response?.current_status=="failed"))
                    {
                        const updateDetails ={
                            status:response.current_status
                        }
                        console.log('update obj',updateDetails,index)
                        // let callBackDetails = {
                        //     transaction_id: item.transactionId,
                        //     status: response?.current_status=='success', //details.TRANSACTIONPAYMENTSTATUS,
                        //     amount: item.amount,
                        //     utr: "",
                        //     phone: item.phone,
                        //     username: item.username,
                        //     upiId: item.upiId,
                        //     date: item.transaction_date,
                        //   };
                        // console.log(callBackDetails)
                        updateTransactionStatus(item?.transactionId,updateDetails)
                    }else if(response?.current_status=='pending'){
                        const isOld = isOlderThan45MinutesIST(item?.transaction_date);
                         console.log(isOld ? `${index} Yes, it's older than 45 minutes.` : "No, it's not older than 45 minutes.");
                         if(isOld)
                         {
                            const updateDetails ={
                                status:"expired",
                                reason:'user did not complete the transaction',
                                code:'u69'
                            }
                            // let callBackDetails = {
                            //     transaction_id: item.transactionId,
                            //     status: response?.current_status=='success', //details.TRANSACTIONPAYMENTSTATUS,
                            //     amount: item.amount,
                            //     utr: "",
                            //     phone: item.phone,
                            //     username: item.username,
                            //     upiId: item.upiId,
                            //     date: item.transaction_date,
                            //   };
                            // console.log(callBackDetails)
                            updateTransactionStatus(item?.transactionId,updateDetails)
                         }
                    }
                }
            })
        }
    }catch(error)
    {
        console.log(error)
    }
    
}
module.exports={
    updatePendingTransactionStatus
}