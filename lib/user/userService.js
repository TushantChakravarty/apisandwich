
/*#################################            Load modules start            ########################################### */
require('@pancakeswap-libs/sdk')
const dao = require('./userDao')
const usrConst = require('./userConstants')
const mapper = require('./userMapper')
const constants = require('../constants')
const appUtils = require('../appUtils')
const jwtHandler = require('../jwtHandler')
const ObjectId = require('mongoose').Types.ObjectId
const appUtil = require('../appUtils')
const mongoose = require('mongoose');
var WebSocket = require('ws');
const conn = mongoose.connection;
const Email = require('./userEmail')
const Template = require('./emailTemplate')
const ethers = require("ethers");
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction;
var Common = require('ethereumjs-common').default;
const { ChainId, Token, TokenAmount, Fetcher, Pair, Route, Trade, TradeType, Percent } = require('@pancakeswap-libs/sdk');
const { JsonRpcProvider } = require("@ethersproject/providers");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const fs = require("fs");
const fetch = require('cross-fetch');
const market = require('../Market/marketDao')
const { processTransactionTest2, processPayinRequest } = require('../controllers/paymentController')

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
                    let password = appUtils.generatePassword(20,'123456789abcdefghijklmnopqrstuvwxyz')
                    let convertedPass = await appUtil.convertPass(password);
                    details.password = convertedPass
                    const apiKey = Math.random().toString(36).slice(2)
                    console.log(apiKey)
                    details.apiKey = apiKey





                    /*   let mailSent = Email.sendMessage( details.emailId)
                       console.log({ mailSent })*/


                    return dao.createUser(details).then((userCreated) => {

                        if (userCreated) {

                            //             const EmailTemplate=Template.register(details.OTP)
                            // //console.log(isExist.emailId)
                            //            let mailSent = Email.sendMessage2(details.emailId,EmailTemplate)
                            //             console.log(mailSent)
                            // let filteredUserResponseFields = mapper.filteredUserResponseFields(userCreated)
                            let responseData ={
                                email:userCreated[0].emailId,
                                password:password,
                                apiKey:userCreated[0].apiKey
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


function confirmOtp(details) {
    if (!details) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
    } else {

        if (details.emailId) {
            let query = {
                emailId: details.emailId
            }

            return dao.getUserDetails(query).then(async (userExists) => {

                if (!userExists) {

                    return mapper.responseMapping(usrConst.CODE.BadRequest, 'user does not exist')

                } else {




                    console.log(userExists)
                    if (userExists.OTP == details.otp) {
                        let updateObj = {
                            isEmailVerified: true
                        }

                        return dao.updateProfile(query, updateObj).then((userUpdated) => {

                            if (userUpdated) {

                                // let usrObj = {
                                //     _id: userUpdated._id,
                                //     emailId: userUpdated.emailId,
                                //     contactNumber: userUpdated.contactNumber
                                // }
                                // return jwtHandler.genUsrToken(usrObj).then((token) => {
                                console.log('success')
                                return mapper.responseMapping(usrConst.CODE.Success, usrConst.MESSAGE.Success)

                            }
                            else {
                                console.log('error')
                                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, 'server error')

                            }

                        })
                    } else {

                        console.log("invalid otp")
                        return mapper.responseMapping(usrConst.CODE.InvalidOtp, 'invalid OTP')

                    }

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

    if (!details.emailId && !details.password ) {

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


/**
 * Forgot password
 * @param {String} emailId email id of user to send password recovery link
 */
function forgotPassword(emailId) {

    if (!emailId) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
    } else {

        let query = {
            emailId: emailId
        }
        return dao.getUserDetails(query).then(async (isExist) => {

            if (isExist) {


                console.log(isExist._id)
                const EmailTemplate = Template.forgotPassword(isExist._id)
                //console.log(isExist.emailId)
                let mailSent = Email.sendMessage2(isExist.emailId, EmailTemplate)
                console.log(mailSent)
                //mailHandler.SEND_MAIL(usrObj, templateDetails, serviceDetails)

                return mapper.responseMapping(usrConst.CODE.Success, usrConst.MESSAGE.ResetPasswordMailSent)

            } else {

                return mapper.responseMapping(usrConst.CODE.DataNotFound, usrConst.MESSAGE.InvalidCredentials)
            }
        }).catch((e) => {

            console.log({ e })
            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Set new password
 * @param {string} redisId redis id for recovering password
 * @param {string} password new password to set
 */
async function setNewPassword(redisId, password) {

    if (!redisId || !password) {

        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    } else {
        console.log(redisId)
        let query = {
            _id: redisId
        }

        // let isUserExists = await dao.getUserDetails(query)
        let isUserExists = await dao.getUserDetails(query)
        console.log(isUserExists)
        //redisServer.getRedisDetails(redisId)

        if (isUserExists) {

            let newPass = await appUtils.convertPass(password);

            let query = {
                _id: redisId
            }
            let updateObj = {
                password: newPass
            }
            return dao.updateProfile(query, updateObj).then(async (updateDone) => {

                if (updateDone) {



                    //await dao.getServiceDetails(thirdPartyServiceQuery)
                    let mailConfig = Email.sendMessage(isUserExists.emailId)
                    console.log(mailConfig)
                    //mailHandler.SEND_MAIL(mailBodyDetails, templateDetails, serviceDetails)


                    return mapper.responseMapping(usrConst.CODE.Success, usrConst.MESSAGE.PasswordUpdateSuccess)

                } else {
                    console.log("Failed to reset password");
                    return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                }

            }).catch((e) => {

                console.log({ e })
                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
            })

        } else {

            return mapper.responseMapping(usrConst.CODE.DataNotFound, usrConst.MESSAGE.ResetPasswordLinkExpired)
        }
    }
}


async function sendPaymentRequest(details) {
    return await validateRequest(details)
        .then(async (response) => {
            console.log(response)
            // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
            if (response == true) {
                console.log(details)
                let bankDetails =
                {
                    "emailId": `${details.emailId}`,
                    "apiKey": `${details.apiKey}`,
                    "request_type": "withdrawal",
                    "data": {
                        "midcode": "30",
                        "payby": "netbanking",
                        "currency": "inr",
                        "country": "in",
                        "merchant_ref_no": "9833595",
                        "notification_url": "string",
                        "hash": "5d3861f153dd1ce126887a0e76d99176a444ab6601e0e0a9d98ba298c5626c5e",
                        "amount": `${details.amount}`,
                        "account_holder_name": `${details.accountName}`,
                        "account_number": `${details.accountNo}`,
                        "bank_name": `${details.bank}`,
                        "bank_code": `${details.ifscCode}`,
                        "bank_branch": "mumbai",
                        "bank_address": "mumbai",
                        "info": "string",
                        "ipaddress": "103.176.136.52",
                        "phone": "9340079982",
                        "email": "na@gmail.com",
                        "address": "",
                        "account_type": "string",
                        "document_id": "string",
                        "document_type": "string",
                        "custom_field_1": "string",
                        "custom_field_2": "string",
                        "custom_field_3": "string",
                        "custom_field_4": "string",
                        "custom_field_5": "string"
                    }
                }

                const resp = await processTransactionTest2(bankDetails)
                console.log(resp)
                if (resp.success == true) {
                    const query = {
                        emailId: details.emailId
                    }
                    const updateDetails = {
                        transactionId: resp.data.transaction_id,
                        merchant_ref_no: resp.data.merchant_ref_no,
                        amount: resp.data.amount,
                        currency: resp.data.currency,
                        country: resp.data.country,
                        status: resp.data.status,
                        hash: resp.data.hash,
                        payout_type: resp.data.payout_type,
                        message: resp.data.message,
                        transaction_date: resp.data.transaction_date,
                    }
                    dao.updateTransaction(query, updateDetails)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Payment request submitted')
                } else {
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, resp)
                }
            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
    //    const response = await processTransactionTest2(details)
    //    return response
}
async function sendPayinRequest(details) {
    return await validateRequest(details)
        .then(async (response) => {
            console.log(response)
            // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
            if (response == true) {
                console.log(details)
                let bankDetails =
                {
                    "emailId": `${details.emailId}`,
                    "apiKey": `${details.apiKey}`,
                    "request_type": "deposit",
                    "data": {
                        "midcode": "30",
                        "payby": "upi",
                        "amount": details.amount,
                        "hash": "",
                        "currency": "inr",
                        "country": "in",
                        "notification_url": "string",
                        "return_url": "string",
                        "merchant_ref_no": "8788",
                        "firstname": "romesh",
                        "lastname": "sharma",
                        "city": "mumbai",
                        "address": "mumbai",
                        "state": "mh",
                        "zipcode": "495006",
                        "phone": "7890989899",
                        "ipaddress": "103.176.136.52",
                        "email": "na@gmail.com",
                        "vpa_address": details.upiId,
                        "checkout_type": "seamless",
                        "postcode": "495006",
                        "custom_field_1": "string",
                        "custom_field_2": "string",
                        "custom_field_3": "string",
                        "custom_field_4": "string",
                        "custom_field_5": "string",
                        "risk_data": {
                            "user_category": "default",
                            "device_fingerprint": "test"
                        }
                    }
                }

                const resp = await processPayinRequest(bankDetails)
                console.log(resp)
                if (resp.success == true) {
                    const query = {
                        emailId: details.emailId
                    }
                    const updateDetails = {
                        transactionId: resp.data.transaction_id,
                        merchant_ref_no: resp.data.merchant_ref_no,
                        amount: resp.data.amount,
                        currency: resp.data.currency,
                        country: resp.data.country,
                        status: resp.data.status,
                        hash: resp.data.hash,
                        payout_type: resp.data.payout_type,
                        message: resp.data.message,
                        transaction_date: resp.data.transaction_date,
                    }
                    dao.updateTransaction(query, updateDetails)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Payment request submitted')
                } else {
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, resp)
                }
            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
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


module.exports = {



    register,

    login,

    forgotPassword,

    setNewPassword,

    confirmOtp,

    sendPaymentRequest,

    getAllUserTransactions,

    sendPayinRequest

}
