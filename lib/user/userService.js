
/*#################################            Load modules start            ########################################### */
// require('@pancakeswap-libs/sdk')
const dao = require('./userDao')
const adminDao = require('./adminDao')
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
const moment = require('moment-timezone');
const fs = require("fs");
const fetch = require('cross-fetch');
// const market = require('../Market/marketDao')
const { processTransactionTest2, processPayinRequest, processPayinRequestBank, bazorPay, processPayinRequestBazorpay, fetchBazorpayPaymentStatus, fetchPayintStatus } = require('../controllers/paymentController')
const { pinwalletPayin } = require('../controllers/pinwallet')
const { intentPayPayin } = require('../controllers/intentpay')
const { generateTokenPaythrough, paythroughyPayin } = require('../controllers/paythrough')
const querystring = require('querystring');

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
            const decryptedKey = appUtils.decryptText(details.apiKey)
            console.log('validate decrypted key',decryptedKey)
            if (decryptedKey == userExists.apiKey) {
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

async function validateAdminRequest(details) {
    let query = {
        emailId: details.email_Id
    }
    return adminDao.getUserDetails(query).then(async (userExists) => {
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
        return validateAdminRequest(details)
            .then((response) => {
                if (response == true) {


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
                                const encrytedKey = appUtils.encryptText(apiKey)
                                console.log('encrypted key',encrytedKey)
                                details.apiKey = apiKey
                                details.balance = 0




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
                                            apiKey: encrytedKey
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
                } else if (response == false) {
                    return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
                } else {
                    return response
                }
            })
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
                            const apiKey = appUtils.encryptText(userUpdated.apiKey)
                            updateObj.apiKey = apiKey
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

async function updateProfile(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }

                return dao.updateProfile(query, details).then((userUpdated) => {
                    if (userUpdated) {
                        console.log('success', userUpdated)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userUpdated)


                    } else {

                        console.log("Failed to update ")
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    }
                })
            }
            else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return mapper.responseMapping(usrConst.CODE.BadRequest, response)
            }
        })
}

async function updateCallbackUrl(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }
            let updateDetails={
                callbackUrl:details.callbackUrl
            }

                return dao.updateProfile(query, updateDetails).then((userUpdated) => {
                    if (userUpdated) {
                        console.log('success', userUpdated)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userUpdated)


                    } else {

                        console.log("Failed to update ")
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    }
                })
            }
            else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return mapper.responseMapping(usrConst.CODE.BadRequest, response)
            }
        })
}

async function updateRedirectUrl(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }
            let updateDetails={
                redirectUrl:details.redirectUrl
            }

                return dao.updateProfile(query, updateDetails).then((userUpdated) => {
                    if (userUpdated) {
                        console.log('success', userUpdated)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userUpdated)


                    } else {

                        console.log("Failed to update ")
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    }
                })
            }
            else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return mapper.responseMapping(usrConst.CODE.BadRequest, response)
            }
        })
}


async function updateTransaction(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }
                let updateObj = {
                    status: details.status
                }
                // if(details.balance&&details.balance!=null)
                // {
                //     let updateObj={}
                //     updateObj.balance = details.balance
                //     // let updatedBalance = details.balance
                //     // updateObj.balance = updatedBalance
                //      dao.updateProfile(query, updateObj)
                // }
                console.log(details)

                return dao.updateTransactionData(query, details.transactionId, updateObj).then((userUpdated) => {
                    if (userUpdated) {
                        console.log('success', userUpdated)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userUpdated)


                    } else {

                        console.log("Failed to update ")
                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                    }
                })
            }
            else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return mapper.responseMapping(usrConst.CODE.BadRequest, response)
            }
        })
}


async function sendPaymentRequest(details) {
    return await validateRequest(details)
        .then(async (response) => {
            console.log(response)
            // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)

            if (response == true) {
                let query = {
                    emailId: details.emailId
                }
                console.log(details)
                return dao.getUserDetails(query).then(async (userData) => {
                    const balance = userData.balance
                    console.log('balance', balance)
                    if (balance&&Number(balance) > Number(details.amount)) {
                        // let updatedBalance = balance - Number(details.amount)
                        // updateObj.balance = updatedBalance
                        // dao.updateProfile(query,updateObj)
                        let gateway = 'bazorpay'
                        let bankDetails =
                        {
                            "emailId": `${details.emailId}`,
                            "apiKey": `${details.apiKey}`,
                            "phone": `${details.phone}`,
                            "upi": `${details?.upiId ? details.upiId : ''}`,
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
                        if (gateway == 'bazorpay') {
                            return await bazorPay(bankDetails)
                                .then((response) => {
                                    if (response) {
                                        if (response.message == 'payout requested') {
                                            const query = {
                                                emailId: details.emailId
                                            }
                                            const timeElapsed = Date.now();
                                            const today = new Date(timeElapsed);
                                            let updateObj = {
                                                balance: 0
                                            }

                                            const updateDetails = {
                                                transactionId: response.data.transaction_id,
                                                merchant_ref_no: '123456',
                                                amount: details.amount,
                                                currency: 'inr',
                                                country: 'in',
                                                status: 'IN-PROCESS',
                                                hash: 'XYZZZZ',
                                                payout_type: 'net banking',
                                                message: 'IN-PROCESS',
                                                transaction_date: today.toISOString(),
                                                gateway: gateway

                                            }
                                            // dao.getUserDetails(query).then((userData) => {
                                            //     const balance = userData.balance
                                            //     console.log('balance', balance)
                                            //     if (balance && balance > details.amount) {
                                            //         let updatedBalance = balance - Number(details.amount)
                                            //         updateObj.balance = updatedBalance
                                            //         dao.updateProfile(query, updateObj)
                                            //     }
                                            //     // else{
                                            //     //     // let updatedBalance = Number(details.amount)
                                            //     //     // updateObj.balance = updatedBalance
                                            //     //     // dao.updateProfile(query,updateObj)
                                            //     //     return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'Low Balance')

                                            //     // }
                                            // })
                                            dao.updateTransaction(query, updateDetails)
                                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Payment request submitted')

                                        } else {
                                            return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, response)

                                        }
                                    } else {
                                        return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)

                                    }
                                })
                        }

                        const resp = await processTransactionTest2(bankDetails)
                        console.log(resp)
                        if (resp.success == true) {
                            const query = {
                                emailId: details.emailId
                            }
                            let updateObj = {
                                balance: 0
                            }
                            const updateDetails = {
                                transactionId: resp.data.transaction_id,
                                merchant_ref_no: resp.data.merchant_ref_no,
                                amount: resp.data.amount,
                                currency: resp.data.currency,
                                country: resp.data.country,
                                status: 'IN-PROCESS',
                                hash: resp.data.hash,
                                payout_type: resp.data.payout_type,
                                message: 'IN-PROCESS',
                                transaction_date: resp.data.transaction_date,
                                gateway: gateway

                            }
                            // dao.getUserDetails(query).then((userData) => {
                            //     const balance = userData.balance
                            //     console.log('balance', balance)
                            //     // if (balance && balance > details.amount) {
                            //     //     let updatedBalance = balance - Number(details.amount)
                            //     //     updateObj.balance = updatedBalance
                            //     //     dao.updateProfile(query, updateObj)
                            //     // }
                            //     // else{
                            //     //     // let updatedBalance = Number(details.amount)
                            //     //     // updateObj.balance = updatedBalance
                            //     //     // dao.updateProfile(query,updateObj)
                            //     //     return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'Low Balance')

                            //     // }
                            // })
                            dao.updateTransaction(query, updateDetails)
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Payment request submitted')
                        } else {
                            return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, resp)
                        }

                    } else {
                        // let updatedBalance = Number(details.amount)
                        // updateObj.balance = updatedBalance
                        // dao.updateProfile(query,updateObj)
                        return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'Low Balance')

                    }
                })
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
                let gateway = 'bazarpay'

                console.log(details)
                let bankDetails =
                {
                    "emailId": `${details.emailId}`,
                    // "apiKey": `${details.apiKey}`,
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
                let query ={
                    emailId:details.emailId
                }
                return dao.getUserDetails(query).then(async (userData) => {
                    let gateway = userData.gateway
                    let redirectUrl = userData.redirectUrl
                    console.log(redirectUrl)
                if(gateway)
                {
                if (gateway == 'bazarpay') {

                    return processPayinRequestBazorpay(details)
                        .then((resp) => {
                          

                            
                            if (gateway) {
                                if (gateway) {
                                    const query = {
                                        emailId: details.emailId
                                    }
                                    let updateObj = {
                                        balance: 0
                                    }
                                    const txId = Math.floor(Math.random()*90000) + 10000;
                                    const timeElapsed = Date.now();
                                    const today = new Date(timeElapsed);
                                    const updateDetails = {
                                        transactionId: txId,
                                        merchant_ref_no: '1',
                                        amount: details.amount,
                                        currency: 'inr',
                                        country: 'in',
                                        status: 'IN-PROCESS',
                                        hash: 'xyzbazorpay',
                                        payout_type: 'PAYIN',
                                        message: 'IN-PROCESS',
                                        transaction_date: today.toISOString(),
                                        gateway: gateway

                                    }
                                    // dao.getUserDetails(query).then((userData) => {
                                    //     const balance = userData.balance
                                    //     console.log('balance', balance)
                                    //     if (balance) {
                                    //         let updatedBalance = balance + Number(details.amount)
                                    //         updateObj.balance = updatedBalance
                                    //         dao.updateProfile(query, updateObj)
                                    //     } else {
                                    //         let updatedBalance = Number(details.amount)
                                    //         updateObj.balance = updatedBalance
                                    //         dao.updateProfile(query, updateObj)
                                    //     }
                                    // })


                                    //
                                    //console.log(resp)
                                    const urls ={
                                        gpayurl: resp.success.gpayurl,
                                        paytmurl: resp.success.paytmurl,
                                        phonepeurl: resp.success.phonepeurl,
                                        upiurl: resp.success.upiurl,
                                    }
                                   const gpayurl = encodeURIComponent(urls.gpayurl)
                                   const phonepeurl = encodeURIComponent(urls.phonepeurl)
                                   const paytmurl= encodeURIComponent(urls.paytmurl)
                                   const upiurl = encodeURIComponent(urls.upiurl)



                                    let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${txId}&gateway=payhubb&gpay=${gpayurl}&phonepe=${phonepeurl}&paytm=${paytmurl}&upi=${upiurl}`
                                    if(redirectUrl)
                                    {
                                        url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${txId}&gateway=payhubb&url=${redirectUrl}&gpay=${gpayurl}&phonepe=${phonepeurl}&paytm=${paytmurl}&upi=${upiurl}`
                                    }
                                    dao.updateTransaction(query, updateDetails)
                                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, url)

                                } else {
                                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails,'invalid details')
                                }
                            } else {
                                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)

                            }
                      
                        })
                }
                if(gateway=='pinwallet')
                {
                    return pinwalletPayin(details)
                    .then((response)=>{
                        console.log(response.message)
                        if(response.responseCode==200)
                        {
                            const query = {
                                emailId: details.emailId
                            }
                            const timeElapsed = Date.now();
                            const today = new Date(timeElapsed);
                            const updateDetails = {
                                transactionId: response.data.pinWalletTransactionId,
                                merchant_ref_no: response.data.userTrasnactionId,
                                amount: details.amount,
                                currency: 'inr',
                                country: 'in',
                                status: 'IN-PROCESS',
                                hash: 'xyzPinwallet',
                                payout_type: 'PAYIN',
                                message: 'IN-PROCESS',
                                transaction_date: today.toISOString(),
                                gateway: gateway

                            }
                            const encodedUri = encodeURIComponent(response.data.qr)
                            let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.data.userTrasnactionId}&gateway=payhubp&qr=${encodedUri}`

                            dao.updateTransaction(query, updateDetails)

                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, url)

                        }else{
                            return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails,response.message)

                        }
                    })
                }

                if(gateway=='intentpay')
                {
                    return intentPayPayin()
                    .then((response)=>{
                        if(response.status==200)
                        {
                            const encodedUri = encodeURIComponent(response.upiIntent)
                            const decodeUri = decodeURIComponent(encodedUri)
                            console.log(decodeUri)
                            let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.transactionId}&gateway=payhubi&qr=${encodedUri}`
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, url)

                        }
                    })
                }
                // if(gateway=='paythrough')
                // {
                //     return generateTokenPaythrough()
                //     .then((response)=>{
                //         if(response)
                //         {
                //             details.access_token = response
                //            return paythroughyPayin(details)
                //             .then((response)=>{
                //                 if(response.status_code==200)
                //                 {
                //                     const timeElapsed = Date.now();
                //                     const today = new Date(timeElapsed);
                //                     const query = {
                //                         emailId: details.emailId
                //                     }
                //                     const updateDetails = {
                //                         transactionId: response.transaction_id,
                //                         merchant_ref_no: response.order_id,
                //                         amount: response.amount,
                //                     currency: 'inr',
                //                     country: 'in',
                //                     status: 'IN-PROCESS',
                //                     hash: 'xyzPaythrough',
                //                     payout_type: 'PAYIN',
                //                     message: 'IN-PROCESS',
                //                     transaction_date: today.toISOString(),
                //                     gateway: gateway
                                
                //                 }
                //                 dao.updateTransaction(query, updateDetails)

                //                 return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
                //             }else{
                //                 return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError,response)

                //             }
                //             })
                //             // const encodedUri = encodeURIComponent(response.upiIntent)
                //             // const decodeUri = decodeURIComponent(encodedUri)
                //             // console.log(decodeUri)
                //             // let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.transactionId}&gateway=payhubi&qr=${encodedUri}`
                            

                //         }else{
                //             return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                //         }
                //     })
                // }

                const resp = await processPayinRequest(bankDetails)
                console.log(resp)
                if (resp.success == true) {
                    const query = {
                        emailId: details.emailId
                    }
                    let updateObj = {
                        balance: 0
                    }
                    const updateDetails = {
                        transactionId: resp.data.transaction_id,
                        merchant_ref_no: resp.data.merchant_ref_no,
                        amount: resp.data.amount,
                        currency: resp.data.currency,
                        country: resp.data.country,
                        status: 'IN-PROCESS',
                        hash: resp.data.hash,
                        payout_type: resp.data.payout_type,
                        message: 'IN-PROCESS',
                        transaction_date: resp.data.transaction_date,
                        gateway: gateway
                    }
                    // dao.getUserDetails(query).then((userData) => {
                    //     const balance = userData.balance
                    //     console.log('balance', balance)
                    //     if (balance) {
                    //         let updatedBalance = balance + Number(details.amount)
                    //         updateObj.balance = updatedBalance
                    //         dao.updateProfile(query, updateObj)
                    //     } else {
                    //         let updatedBalance = Number(details.amount)
                    //         updateObj.balance = updatedBalance
                    //         dao.updateProfile(query, updateObj)
                    //     }
                    // })
                    dao.updateTransaction(query, updateDetails)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Payin request submitted')
                } else {
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, resp)
                }
            }else{
                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.InvalidDetails)

            }
            })
            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
}


async function sendPayinRequestIntent(details) {
    return await validateRequest(details)
        .then(async (response) => {
            console.log(response)
            // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
            if (response == true) {
                let gateway = 'bazarpay'

                console.log(details)
                let bankDetails =
                {
                    "emailId": `${details.emailId}`,
                    // "apiKey": `${details.apiKey}`,
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
                let query ={
                    emailId:details.emailId
                }
                return dao.getUserDetails(query).then(async (userData) => {
                    let gateway = userData.premiumGateway
                    let redirectUrl = userData.redirectUrl
                    console.log(redirectUrl)
                if(gateway)
                {
               
                if(gateway=='paythrough')
                {
                    return generateTokenPaythrough()
                    .then((response)=>{
                        if(response)
                        {
                            details.access_token = response
                           return paythroughyPayin(details)
                            .then((response)=>{
                                if(response.status_code==200)
                                {
                                    const timeElapsed = Date.now();
                                    const today = new Date(timeElapsed);
                                    const query = {
                                        emailId: details.emailId
                                    }
                                    const updateDetails = {
                                        transactionId: response.transaction_id,
                                        merchant_ref_no: response.order_id,
                                        amount: response.amount,
                                    currency: 'inr',
                                    country: 'in',
                                    status: 'IN-PROCESS',
                                    hash: 'xyzPaythrough',
                                    payout_type: 'PAYIN',
                                    message: 'IN-PROCESS',
                                    transaction_date: today.toISOString(),
                                    gateway: gateway
                                
                                }
                                dao.updateTransaction(query, updateDetails)

                                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
                            }else{
                                return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError,response)

                            }
                            })
                            // const encodedUri = encodeURIComponent(response.upiIntent)
                            // const decodeUri = decodeURIComponent(encodedUri)
                            // console.log(decodeUri)
                            // let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.transactionId}&gateway=payhubi&qr=${encodedUri}`
                            

                        }else{
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }

                
            }else{
                return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.InvalidDetails)

            }
            })
            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
}

async function sendPayinRequestBank(details) {
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

                const resp = await processPayinRequestBank(bankDetails)
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
                    const query = {
                        emailId:details.emailId}
                    const response = await dao.getAllTransactions(query)
                    console.log('my response',response)
                    if(response?.transactions!=null)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response.transactions)
                else
                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, [])

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

    if(!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
     const query = {
    emailId:details.emailId}
    const response = await dao.getAllTransactions(query)
    console.log(response)
    if(response)
    {
        const encrytedKey = appUtils.encryptText(response.apiKey)

        let ProfileData = response
        ProfileData.apiKey = encrytedKey

        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success,ProfileData)
    }
    else
    return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')


}

async function getAllUsersTransactions(details) {
    if (details.email_Id && details.apiKey) {
        return await validateAdminRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await dao.getAllUsersTransactions()
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

async function getBazorpayPaymentStatus(details) {
    const response = await fetchBazorpayPaymentStatus(details)
    //console.log(JSON.parse(response.message))
    const validJsonString = response.message.replace(/'/g, "\"");

    // Parse the JSON string into a JavaScript object
    const jsonObject = JSON.parse(validJsonString);
    if (jsonObject.statusCode == 200) {

        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, jsonObject.data[0])
    }
    else {
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, jsonObject)
    }

}

async function getPayinStatus(details) {
    console.log(details)
    return validateRequest(details)
    .then(async (response)=>{
        if(response == true)
        {
            const response = await fetchPayintStatus(details)
            //console.log(JSON.parse(response.message))
            // const validJsonString = response.message.replace(/'/g, "\"");
        
            // // Parse the JSON string into a JavaScript object
            // const jsonObject = JSON.parse(validJsonString);
            if (response.transaction) {
        
                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response.transaction)
            }
            else {
                return mapper.responseMappingWithData(usrConst.CODE.DataNotFound, usrConst.MESSAGE.InvalidDetails, 'transaction not found')
            }
        }else if (response == false) {
            return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
        } else {
            return response
        }
    })
   

}

async function getPinwalletPayinStatus(details)
{
    console.log(details)
    let query ={
        emailId:details.emailId
    }
    return dao.fetchTxDetail(query, details.transactionId)
    .then((response)=>{
        console.log(response)
        return response
    })
}

async function getVolumes(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                   
               
    const query = {
        emailId: details.emailId
    }
    const response = await dao.getAllUserTransactions(query)
    const successfulTransactions = response.transactions.filter(transaction => transaction.status === 'success');
    function isYesterday(dateString) {
        const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
        const yesterday = moment.tz('Asia/Kolkata').subtract(1, 'days').startOf('day'); // Start of yesterday in IST
        const today = moment.tz('Asia/Kolkata').startOf('day'); // Start of today in IST
    
        return transactionDate >= yesterday && transactionDate < today;// Compare within the same day
      }
      
      // Function to check if a date is today
      function isToday(dateString) {
        const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
        const today = moment.tz('Asia/Kolkata'); // Get the current time in IST
    
        return transactionDate.isSame(today, 'day');

    }
      
      // Function to check if a date is within the last 7 days (weekly)
      function isWithinLastWeek(dateString) {
        const date = new Date(dateString);
        const oneWeekAgo = new Date();
        oneWeekAgo.setUTCHours(0, 0, 0, 0);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return date >= oneWeekAgo && date < new Date(); // Compare within the same day
      }
      // Get the current date in the same format as the 'transaction_date'
      const currentDate = new Date().toISOString();
      
      // Initialize arrays for yesterday, today, and weekly transactions
      const yesterdayTransactions = [];
      const todayTransactions = [];
      const weeklyTransactions = [];
      
      // Iterate through successful transactions
      for (const transaction of successfulTransactions) {
        const transactionDate = new Date(transaction.transaction_date);
      
         if (isToday(transactionDate)) {
          todayTransactions.push(transaction);
        } 
      }
      for (const transaction of successfulTransactions) {
        const transactionDate = new Date(transaction.transaction_date);
      
        // Check if the transaction date falls into yesterday, today, or within the last 7 days (weekly)
        if (isYesterday(transactionDate)) {
          yesterdayTransactions.push(transaction);
        } 
      }
      for (const transaction of successfulTransactions) {
        const transactionDate = new Date(transaction.transaction_date);
      
        // Check if the transaction date falls into yesterday, today, or within the last 7 days (weekly)
       if (isWithinLastWeek(transactionDate)) {
          weeklyTransactions.push(transaction);
        }
      }
      
      // Now, you have three arrays: yesterdayTransactions, todayTransactions, and weeklyTransactions
    //   console.log("Yesterday's Transactions:", yesterdayTransactions);
    //   console.log("Today's Transactions:", todayTransactions);
    //   console.log("Weekly Transactions:", weeklyTransactions);

    function calculateTotalAmount(transactions) {
        return transactions.reduce((total, transaction) => total + transaction.amount, 0);
      }
      
      // Calculate the total amount for yesterday, today, and weekly transactions
      const totalAmountYesterday = calculateTotalAmount(yesterdayTransactions);
      const totalAmountToday = calculateTotalAmount(todayTransactions);
      const totalAmountWeekly = calculateTotalAmount(weeklyTransactions);
      
      // Create objects with the desired structure
      const yesterdayObject = { volume: totalAmountYesterday, transactions: yesterdayTransactions };
      const todayObject = { volume: totalAmountToday, transactions: todayTransactions };
      const weeklyObject = { volume: totalAmountWeekly, transactions: weeklyTransactions };
      
      // Now you have the three objects with the specified structure
    //   console.log("Yesterday's Object:", yesterdayObject);
    //   console.log("Today's Object:", todayObject);
    //   console.log("Weekly Object:", weeklyObject);

      let responseData= {
        yesterdayObject,
        todayObject,
        weeklyObject
    }
   // console.log(response)
    if (responseData)
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)
    else
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
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

    sendPayinRequest,

    resetPassword,

    getAllUsersTransactions,

    getBazorpayPaymentStatus,

    updateProfile,

    updateTransaction,

    getProfileData,
    
    getPayinStatus,

    getPinwalletPayinStatus,

    updateCallbackUrl,

    updateRedirectUrl,

    sendPayinRequestIntent,

    getVolumes

}
