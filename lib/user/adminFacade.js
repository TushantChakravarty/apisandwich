

/*#################################            Load modules start            ########################################### */
const service = require('./adminService')

/*#################################            Load modules end            ########################################### */





/**
 * Register user
 * @param {Object} details user details to get registered
 */
function register(details) {

    return service.register(details).then(data => data)
}


/**
 * Login
 * @param {Object} details user details
 */
function login(details) {

    return service.login(details).then(data => data)
}

function resetPassword(details) {

    return service.resetPassword(details).then(data => data)
}


function getAllUserTransactions(details) {

    return service.getAllUserTransactions(details).then(data => data)
}

function getUserTransactionData(details) {

    return service.getUserTransactionData(details).then(data => data)
}

function getAllUsersTransactions(details) {

    return service.getAllUsersTransactions(details).then(data => data)
}

function getAllTx(details) {

    return service.getAllTx(details).then(data => data)
}
function getProfileData(details) {

    return service.getProfileData(details).then(data => data)
}
function updateUserProfile(details) {

    return service.updateUserProfile(details).then(data => data)
}
function saveTx(details) {

    return service.saveTx(details).then(data => data)
}

function saveTxBazarpay(details) {

    return service.saveTxBazapay(details).then(data => data)
}
function saveTxIntentpay(details) {

    return service.saveTxIntentpay(details).then(data => data)
}

function saveTxPaythrough(details) {

    return service.saveTxPaythrough(details).then(data => data)
}

function updateGateway(details) {

    return service.updateGateway(details).then(data => data)
}

function getAdminBalance(details) {

    return service.getAdminBalance(details).then(data => data)
}

function settleMoney(details) {

    return service.settleMoney(details).then(data => data)
}

function getSuccessfulMerchantTransactions(details) {

    return service.getSuccessfulMerchantTransactions(details).then(data => data)
}

function getAllMerchantsData(details) {

    return service.getAllMerchantsData(details).then(data => data)
}

function updatePremium(details) {

    return service.updatePremium(details).then(data => data)
}

function getAllUserSettlements(details) {

    return service.getAllUserSettlements(details).then(data => data)
}

function getUserBalance(details) {

    return service.getUserBalance(details).then(data => data)
}

function updateGatewayPremium(details) {

    return service.updateGatewayPremium(details).then(data => data)
}

function getDataByUtr(details) {

    return service.getDataByUtr(details).then(data => data)
}

function getTransactionsUser(details) {

    return service.getTransactionsUser(details).then(data => data)
}
function getTransactionsByStatus(details) {

    return service.getTransactionsByStatus(details).then(data => data)
}

function getTransactionsByDate(details) {

    return service.getTransactionsByDate(details).then(data => data)
}

function getAllMerchantTransactions(details) {

    return service.getAllMerchantTransactions(details).then(data => data)
}
function getMerchantTransactionByUtr(details) {

    return service.getMerchantTransactionByUtr(details).then(data => data)
}

function getAllMerchantsInfo(details) {

    return service.getAllMerchantsInfo(details).then(data => data)
}

function sendPaymentRequest(details) {

    return service.sendPaymentRequest(details).then(data => data)
}

function getLast24HourData(details) {

    return service.getLast24HourData(details).then(data => data)
}

function updateGatewayFee(details) {

    return service.updateGatewayFee(details).then(data => data)
}

function updatePlatformFee(details) {

    return service.updatePlatformFee(details).then(data => data)
}

function updateGatewayData(details) {

    return service.updateGatewayData(details).then(data => data)
}

function getGatewayDetails(details) {

    return service.getGatewayDetails(details).then(data => data)
}

function getGatewayInfo(details) {

    return service.getGatewayInfo(details).then(data => data)
}

function updateGatewayPayoutFee(details) {

    return service.updateGatewayPayoutFee(details).then(data => data)
}

function updateGatewayCollectionFee(details) {

    return service.updateGatewayCollectionFee(details).then(data => data)
}

module.exports = {


    register,

    login,

    resetPassword,

    getAllUsersTransactions,

    getProfileData,

    updateUserProfile,

    saveTx,

    saveTxBazarpay,

    saveTxIntentpay,

    updateGateway,

    getAllTx,

    getUserTransactionData,

    getAdminBalance,

    settleMoney,

    getSuccessfulMerchantTransactions,

    saveTxPaythrough,

    getAllMerchantsData,

    updatePremium,

    getAllUserSettlements,

    getUserBalance,

    updateGatewayPremium,

    getDataByUtr,

    getTransactionsUser,

    getTransactionsByStatus,

    getTransactionsByDate,

    getAllMerchantTransactions,

    getMerchantTransactionByUtr,

    getAllMerchantsInfo,

    sendPaymentRequest,
    
    getLast24HourData,

    updateGatewayFee,

    updatePlatformFee,

    updateGatewayData,

    getGatewayDetails,

    getGatewayInfo,

    updateGatewayPayoutFee,

    updateGatewayCollectionFee
  
}
//exp://wz-erk.tushant07.munziapp.exp.direct:80