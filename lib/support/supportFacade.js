const service = require('./supportService')

async function getAllMerchants(details)
{
    return service.getAllMerchants(details).then(data => data)
}

async function addAgent(details)
{
    return service.addAgent(details).then(data => data)
}

module.exports ={
    getAllMerchants,

    addAgent
}