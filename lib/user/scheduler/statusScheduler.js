const { encryptParameters } = require("../../appUtils");
const { getAllPendinTransactionsPaythrough, fetchPaythroughStatus } = require("../../controllers/paythrough");
const { updateTransactionStatus } = require("../transactionDao");
const { getUserDetails } = require("../userDao");

async function updatePendingTransactionStatus()
{
    try{

        const paythrough = await getAllPendinTransactionsPaythrough()
        console.log(paythrough.length)
        if(paythrough)
        {
            paythrough.map(async (item,index)=>{
                // let query = {
                //     _id:item?.uuid
                // }
                // const user = await getUserDetails(query)
                if(item&&index<100)
                {
                    //console.log('user',user)

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
                        updateTransactionStatus(item?.transactionId,updateDetails)
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