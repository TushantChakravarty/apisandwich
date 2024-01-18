const mongoose = require('mongoose')
let BaseDao = require('../../dao/BaseDao')
const Admin = require('../../generic/models/adminModel')
const user =  require('../../generic/models/userModel')
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user)
const ObjectId = require('mongoose').Types.ObjectId;


/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getAdminDetails(query) {
    

    return adminDao.findOne(query)
}


function getUserDetails(query) {
    

    return usrDao.findOne(query)
}


module.exports = {

 
    getAdminDetails,

    getUserDetails

}