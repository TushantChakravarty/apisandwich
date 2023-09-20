

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

function getAllUsersTransactions(details) {

    return service.getAllUsersTransactions(details).then(data => data)
}
function getProfileData(details) {

    return service.getProfileData(details).then(data => data)
}
/**
 * Get user profile
 * @param {String} id mongo id of user
 */

module.exports = {


    register,

   

    login,

   
  
    
    resetPassword,

    getAllUsersTransactions,

    getProfileData
  
}
//exp://wz-erk.tushant07.munziapp.exp.direct:80