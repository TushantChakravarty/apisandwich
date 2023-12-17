const service = require('./supportService')

async function getAllMerchants(details)
{
    return service.getAllMerchants(details).then(data => data)
}

module.exports ={
    getAllMerchants
}