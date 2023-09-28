
/*#################################            Load modules start            ########################################### */
const dao = require('./adminDao')
const usrConst = require('./userConstants')
const mapper = require('./userMapper')
const constants = require('../constants')
const appUtils = require('../appUtils')
const jwtHandler = require('../jwtHandler')
const ObjectId = require('mongoose').Types.ObjectId
const appUtil = require('../appUtils')
const userDao = require('./userDao')
const { response } = require('express')
/*#################################            Load modules end            ########################################### */


/**
 * Register user
 * @param {Object} details user details to get registered
 */

async function validateRequest(details) {
    let query = {
        emailId: details.emailId
    }
    return dao.getUserDetails(query).then(async (userExists) => {
        if (userExists) {
            if (details.apiKey == userExists.apiKey) {
                return true
            }
            else {
                return false
            }
        } else {
            return mapper.responseMapping(usrConst.CODE.BadRequest, 'User does not exist')

        }
    })
}
async function validateBalanceRequest(details) {
    let query = {
        emailId: details.email_Id
    }
    return dao.getUserDetails(query).then(async (userExists) => {
        if (userExists) {
            if (details.apiKey == userExists.apiKey) {
                return true
            }
            else {
                return false
            }
        } else {
            return mapper.responseMapping(usrConst.CODE.BadRequest, 'User does not exist')

        }
    })
}
function register(details) {

    if (!details || Object.keys(details).length == 0) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
    } else {

        if (details.emailId) {
            let query = {
                emailId: details.emailId
            }

            return dao.getUserDetails(query).then(async (userExists) => {

                if (userExists) {

                    return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.EmailAlreadyExists)

                } else {

                    // let convertedPass = await appUtil.convertPass(details.password);
                    // details.password = convertedPass

                    // let verificationCode = Math.floor(Math.random() * (999999 - 100000) + 100000)
                    // console.log({ verificationCode })



                    // details.OTP = verificationCode
                    // details.isEmailVerified=false

                    /*
                     details.otpUpdatedAt = new Date().getTime()
                     details.createdAt = new Date().getTime()
                     details.isIdentityVerified = false
                    
                     let loginActivity = []
                     loginActivity.push({
                        
                         status: 'active'
                     })*/

                    // details.loginActivity = loginActivity
                    let password = appUtils.generatePassword(20, '123456789abcdefghijklmnopqrstuvwxyz')
                    let convertedPass = await appUtil.convertPass(password);
                    details.password = convertedPass
                    const apiKey = Math.random().toString(36).slice(2)
                    console.log(apiKey)

                    details.apiKey = apiKey
                    details.balance = 0
                    details.gateway = 'bazorpay'



                    /*   let mailSent = Email.sendMessage( details.emailId)
                       console.log({ mailSent })*/


                    return dao.createUser(details).then((userCreated) => {

                        if (userCreated) {

                            //             const EmailTemplate=Template.register(details.OTP)
                            // //console.log(isExist.emailId)
                            //            let mailSent = Email.sendMessage2(details.emailId,EmailTemplate)
                            //             console.log(mailSent)
                            // let filteredUserResponseFields = mapper.filteredUserResponseFields(userCreated)
                            let responseData = {
                                email: userCreated[0].emailId,
                                password: password,
                                apiKey: userCreated[0].apiKey
                            }
                            console.log(responseData)
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)

                        } else {

                            console.log("Failed to save user")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)

                        }
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    })

                }
            }).catch((err) => {

                console.log({ err })
                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
            })
        }
    }
}




/**
 * Login
 * @param {Object} details user details
 */
function login(details) {

    if (!details.emailId && !details.password) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
    } else {

        let query = {

        }
        if (details.emailId) {

            query.emailId = details.emailId.toLowerCase()
        }
        // if (details.contactNumber) {

        //     query.contactNumber = details.contactNumber
        // }

        return dao.getUserDetails(query).then(async (userDetails) => {
            console.log(query)
            console.log(userDetails)

            if (userDetails) {

                // if (!userDetails.isEmailVerified) {
                //     return mapper.responseMapping(401, 'Please verify your account first')
                // }

                let isValidPassword = await appUtils.verifyPassword(details, userDetails)
                //let isValidPassword = true;  
                console.log(isValidPassword)

                if (isValidPassword) {

                    let token = await jwtHandler.genUsrToken(details)
                    console.log(token)
                    details.token = token
                    let updateObj = {
                        token: token

                    }





                    return dao.updateProfile(query, updateObj).then((userUpdated) => {

                        if (userUpdated) {
                            console.log('success', userUpdated)
                            updateObj.emailId = userUpdated.emailId
                            updateObj.apiKey = userUpdated.apiKey
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, updateObj)


                        } else {

                            console.log("Failed to update ")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    })
                } else {

                    return mapper.responseMapping(405, usrConst.MESSAGE.InvalidPassword)

                }
            } else {

                return mapper.responseMapping(usrConst.CODE.DataNotFound, usrConst.MESSAGE.UserNotFound)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
        })

    }
}

function resetPassword(details) {

    if (!details.emailId && !details.password && !details.newPassword) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
    } else {

        let query = {

        }
        if (details.emailId) {

            query.emailId = details.emailId.toLowerCase()
        }
        // if (details.contactNumber) {

        //     query.contactNumber = details.contactNumber
        // }

        return dao.getUserDetails(query).then(async (userDetails) => {
            console.log(query)
            console.log(userDetails)

            if (userDetails) {

                // if (!userDetails.isEmailVerified) {
                //     return mapper.responseMapping(401, 'Please verify your account first')
                // }

                let isValidPassword = await appUtils.verifyPassword(details, userDetails)
                //let isValidPassword = true;  
                console.log(isValidPassword)

                if (isValidPassword) {

                    let token = await jwtHandler.genUsrToken(details)
                    console.log(token)
                    details.token = token
                    let convertedPass = await appUtil.convertPass(details.newPassword);

                    let updateObj = {
                        token: token,
                        password: convertedPass
                    }





                    return dao.updateProfile(query, updateObj).then((userUpdated) => {

                        if (userUpdated) {
                            console.log('success', userUpdated)
                            updateObj.emailId = userUpdated.emailId
                            updateObj.newPassword = details.newPassword
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, updateObj)


                        } else {

                            console.log("Failed to update ")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    })
                } else {

                    return mapper.responseMapping(405, usrConst.MESSAGE.InvalidPassword)

                }
            } else {

                return mapper.responseMapping(usrConst.CODE.DataNotFound, usrConst.MESSAGE.UserNotFound)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
        })

    }
}

async function getAllUserTransactions(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await dao.getAllTransactions(details)
                    console.log(response)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response.transactions)

                } else if (response == false) {
                    return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
                } else {
                    return response
                }
            })

    } else {
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')

    }
}

async function getAllUsersTransactions(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions()
                    console.log(response)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)

                } else if (response == false) {
                    return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
                } else {
                    return response
                }
            })

    } else {
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')

    }
}

async function getProfileData(details) {

    if (!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
    const query = {
        emailId: details.emailId
    }
    const response = await dao.getAllTransactions(query)
    console.log(response)
    if (response)
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
    else
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')


}

async function updateUserProfile(details) {
    if (!details) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
    return await validateBalanceRequest(details)
        .then(async (response) => {
            if (response == true) {
                let query = {
                    emailId: details.emailId
                }
                return dao.getUserBalance(query)
                    .then((response) => {
                        console.log(response)
                        const balance = response.balance
                        console.log(balance)
                        let query = {
                            emailId: details.emailId
                        }
                        let updateObj = {
                            balance: details.balance + balance
                        }
                        return dao.updateUserProfile(query, updateObj).then((userUpdated) => {
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userUpdated)

                        })
                    })

            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }
        })

}
async function saveTx(details) {
    // return validateRequest(details)
    //     .then((response) => {
    if (details) {
        console.log(details)
        const query = {
            first_name: details.Data.PayerName
        }
        let updateObj = {
            status: details.Data.TxnStatus.toLowerCase()
        }
        if (details.PayerAmount) {
            dao.getUserBalance(query)
                .then((response) => {
                    console.log(response)
                    const balance = response.balance
                    console.log(balance)
                   
                    let updateObj = {
                        balance: details.PayerAmount + balance
                    }
                    dao.updateUserProfile(query, updateObj)
                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        }

        return dao.updateTransactionData(query, details.Data.PinWalletTransactionId, updateObj).then((userUpdated) => {
            if (userUpdated) {
                console.log('success', userUpdated)

                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'success')


            } else {

                console.log("Failed to update ")
                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
            }
        })
    }
    else {
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'invalid details')
    }
    // })
}



module.exports = {



    register,

    login,


    resetPassword,

    getAllUserTransactions,

    getAllUsersTransactions,

    getProfileData,

    updateUserProfile,

    saveTx

}
