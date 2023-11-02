
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
const { callbackPayin } = require('../controllers/callback')
//const moment = require('moment');
const moment = require('moment-timezone');
const { pinwalletPayout, generatePinWalletToken } = require('../controllers/pinwallet')
const { Promise } = require('bluebird')
const adminDao = require('./adminDao')


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

async function getAllUserSettlements(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    let query = {
                        emailId: details.email_Id
                    }
                    const response = await dao.getAllUserTransactions(query)
                    console.log(response)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response.settlements.reverse())

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
async function getUserBalance(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    let query = {
                        emailId: details.email_Id
                    }
                    const response = await dao.getAllUserTransactions(query)
                    console.log(response)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response.balance)

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

async function getAllMerchantsData(details) {
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



async function getAllTx(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {

                    //                     const response = await userDao.getAllUsersTransactions()
                    //                    // console.log(response)
                    //                     const allTransactions = [];

                    // // Iterate through each user and their transactions
                    // for (const user of response) {
                    //     const successfulTransactions = user.transactions.filter(transaction => transaction.status === 'success');
                    //     allTransactions.push(...successfulTransactions);
                    // }

                    // // Now, allTransactions array contains all the transactions from both users
                    // //console.log(allTransactions);
                    // const currentDate = new Date().toISOString();

                    // // Parse the current date to get the year, month, and day
                    // const currentYear = parseInt(currentDate.slice(0, 4));
                    // const currentMonth = parseInt(currentDate.slice(5, 7));
                    // const currentDay = parseInt(currentDate.slice(8, 10));

                    // // Initialize arrays for yesterday, today, and weekly transactions
                    // const yesterdayTransactions = [];
                    // const todayTransactions = [];
                    // const weeklyTransactions = [];
                    // function isYesterday(dateString) {
                    //     const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
                    //     const yesterday = moment.tz('Asia/Kolkata').subtract(1, 'days').startOf('day'); // Start of yesterday in IST
                    //     const today = moment.tz('Asia/Kolkata').startOf('day'); // Start of today in IST

                    //     return transactionDate >= yesterday && transactionDate < today;// Compare within the same day
                    //   }

                    //   // Function to check if a date is today
                    //   function isToday(dateString) {
                    //     const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
                    //     const today = moment.tz('Asia/Kolkata'); // Get the current time in IST

                    //     return transactionDate.isSame(today, 'day');

                    // }


                    //   // Function to check if a date is within the last 7 days (weekly)
                    //   function isWithinLastWeek(dateString) {
                    //     const date = new Date(dateString);
                    //     const oneWeekAgo = new Date();
                    //     oneWeekAgo.setUTCHours(0, 0, 0, 0);
                    //     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    //     return date >= oneWeekAgo && date < new Date(); // Compare within the same day
                    //   }
                    // // Calculate the date one day ago
                    // const yesterdayDate = new Date(currentYear, currentMonth - 1, currentDay - 1).toISOString();

                    // // Calculate the date one week ago
                    // const weeklyStartDate = new Date(currentYear, currentMonth - 1, currentDay - 7).toISOString();

                    // // Iterate through all transactions
                    // for (const transaction of allTransactions) {
                    //     const transactionDate = new Date(transaction.transaction_date);

                    //     if (isToday(transactionDate)) {
                    //         todayTransactions.push(transaction);
                    //     } 
                    //      if (isYesterday(transactionDate)) {
                    //         yesterdayTransactions.push(transaction);
                    //     }  
                    //     if (isWithinLastWeek(transactionDate)) {
                    //         weeklyTransactions.push(transaction);
                    //     }
                    // }

                    // // Now, you have three arrays: yesterdayTransactions, todayTransactions, and weeklyTransactions
                    // // console.log("Yesterday's Transactions:", yesterdayTransactions);
                    // // console.log("Today's Transactions:", todayTransactions);
                    // // console.log("Weekly Transactions:", weeklyTransactions);
                    // function calculateTotalAmountWithSuccessStatus(transactions) {
                    //     return transactions
                    //       .filter(transaction => transaction.status === 'success') // Filter only successful transactions
                    //       .reduce((total, transaction) => total + transaction.amount, 0);
                    //   }

                    //   // Calculate the total amount for yesterday, today, and weekly transactions with 'success' status
                    //   const totalAmountYesterday = calculateTotalAmountWithSuccessStatus(yesterdayTransactions);
                    //   const totalAmountToday = calculateTotalAmountWithSuccessStatus(todayTransactions);
                    //   const totalAmountWeekly = calculateTotalAmountWithSuccessStatus(weeklyTransactions);

                    //   // Create objects with the desired structure
                    //   const yesterdayObject = { volume: totalAmountYesterday, transactions: yesterdayTransactions };
                    //   const todayObject = { volume: totalAmountToday, transactions: todayTransactions };
                    //   const weeklyObject = { volume: totalAmountWeekly, transactions: weeklyTransactions };

                    // Now you have the three objects with the specified structure, considering only 'success' status transactions
                    //   console.log("Yesterday's Object:", yesterdayObject);
                    //   console.log("Today's Object:", todayObject);
                    //   console.log("Weekly Object:", weeklyObject);
                    let adminQuery = {
                        emailId: 'samir123@payhub'
                    }

                    const admin = await dao.getUserDetails(adminQuery)
                    const totalTransactions = admin.totalTransactions
                    const SuccessfulTransactions = admin.successfulTransactions
                    const successRate = (Number(SuccessfulTransactions) / Number(totalTransactions)) * 100
                    const last24hrSuccess = Number(admin.last24hrSuccess)
                    const last24hrTotal = Number(admin.last24hrTotal)
                    const last24hrSuccessRate = (Number(last24hrSuccess) / Number(last24hrTotal)) * 100

                    console.log(totalTransactions, SuccessfulTransactions, successRate)
                    let responseData = {
                        yesterdayObject: { volume: admin.yesterday },
                        todayObject: { volume: admin.last24hr },
                        weeklyObject: { volume: admin.balance },
                        totalTransactions,
                        successfulTransactions: SuccessfulTransactions,
                        successRate,
                        last24hrSuccess,
                        last24hrTotal,
                        last24hrSuccessRate: last24hrSuccessRate ? last24hrSuccessRate : 0

                    }
                    console.log('admin data', responseData)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)

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

async function getAllUserTx(details) {


    const response = await userDao.getAllUsersTransactions()
    // console.log(response)
    const allTransactions = [];

    // Iterate through each user and their transactions
    for (const user of response) {
        const successfulTransactions = user.transactions.filter(transaction => transaction.status === 'success');
        allTransactions.push(...successfulTransactions);
    }

    // Now, allTransactions array contains all the transactions from both users
    //console.log(allTransactions);
    const currentDate = new Date().toISOString();

    // Parse the current date to get the year, month, and day
    const currentYear = parseInt(currentDate.slice(0, 4));
    const currentMonth = parseInt(currentDate.slice(5, 7));
    const currentDay = parseInt(currentDate.slice(8, 10));

    // Initialize arrays for yesterday, today, and weekly transactions
    const yesterdayTransactions = [];
    const todayTransactions = [];
    const weeklyTransactions = [];
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
    // Calculate the date one day ago
    const yesterdayDate = new Date(currentYear, currentMonth - 1, currentDay - 1).toISOString();

    // Calculate the date one week ago
    const weeklyStartDate = new Date(currentYear, currentMonth - 1, currentDay - 7).toISOString();

    // Iterate through all transactions
    for (const transaction of allTransactions) {
        const transactionDate = new Date(transaction.transaction_date);

        if (isToday(transactionDate)) {
            todayTransactions.push(transaction);
        }
        if (isYesterday(transactionDate)) {
            yesterdayTransactions.push(transaction);
        }
        // if (isWithinLastWeek(transactionDate)) {
        //     weeklyTransactions.push(transaction);
        // }
    }

    // Now, you have three arrays: yesterdayTransactions, todayTransactions, and weeklyTransactions
    // console.log("Yesterday's Transactions:", yesterdayTransactions);
    // console.log("Today's Transactions:", todayTransactions);
    // console.log("Weekly Transactions:", weeklyTransactions);
    function calculateTotalAmountWithSuccessStatus(transactions) {
        return transactions
            .filter(transaction => transaction.status === 'success') // Filter only successful transactions
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    // Calculate the total amount for yesterday, today, and weekly transactions with 'success' status
    const totalAmountYesterday = calculateTotalAmountWithSuccessStatus(yesterdayTransactions);
    const totalAmountToday = calculateTotalAmountWithSuccessStatus(todayTransactions);
    const totalAmountWeekly = calculateTotalAmountWithSuccessStatus(weeklyTransactions);

    // Create objects with the desired structure
    const yesterdayObject = { volume: totalAmountYesterday, transactions: yesterdayTransactions };
    const todayObject = { volume: totalAmountToday, transactions: todayTransactions };
    const weeklyObject = { volume: totalAmountWeekly, transactions: weeklyTransactions };

    console.log("Yesterday's Object:", yesterdayObject);
    console.log("Today's Object:", todayObject);
    console.log("Weekly Object:", weeklyObject);
    // let adminQuery = {
    //     emailId: 'samir123@payhub'
    // }

    // const admin = await dao.getUserDetails(adminQuery)
    // const totalTransactions = admin.totalTransactions
    // const SuccessfulTransactions = admin.successfulTransactions
    // const successRate = (Number(SuccessfulTransactions) / Number(totalTransactions)) * 100
    // const last24hrSuccess = Number(admin.last24hrSuccess) 
    // const last24hrTotal = Number(admin.last24hrTotal) 
    // const last24hrSuccessRate = (Number(last24hrSuccess) / Number(last24hrTotal)) * 100

    // console.log(totalTransactions, SuccessfulTransactions, successRate)
    let responseData = {
        yesterdayObject,
        todayObject,


    }
    console.log('admin data', responseData)
    return responseData



}


async function getLast24HourData(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {

                    let userQuery = {
                        emailId: details.email_Id
                    }

                    const user = await dao.getMerchantDetails(userQuery)
                    console.log(user)
                    const totalTransactions = user.last24hrTotal
                    const SuccessfulTransactions = user.last24hrSuccess
                    const successRate = (Number(SuccessfulTransactions) / Number(totalTransactions)) * 100
                    console.log(totalTransactions, SuccessfulTransactions, successRate)
                    let responseData = {
                        totalTransactions,
                        successfulTransactions: SuccessfulTransactions,
                        successRate: successRate ? successRate : 0,
                        yesterday: user.yesterday,
                        balance: user.balance,
                        last24hr: user.last24hr

                    }
                    console.log('admin data', responseData)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)

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



async function getUserTransactionData(details) {

    if (!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
    const query = {
        emailId: details.emailId
    }
    const response = await dao.getAllUserTransactions(query)
    const successfulTransactions = response.transactions.filter(transaction => transaction.status === 'success');
    console.log(successfulTransactions.length)
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
        if (isYesterday(transactionDate)) {
            yesterdayTransactions.push(transaction);
        }
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

    let responseData = {
        yesterdayObject,
        todayObject,
        weeklyObject
    }
    // console.log(response)
    if (responseData)
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)
    else
        return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')


}

async function getAdminBalance(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions()
                    // console.log(response)
                    const allTransactions = [];

                    // Iterate through each user and their transactions
                    for (const user of response) {
                        const successfulTransactions = user.transactions.filter(transaction => transaction.status === 'success');
                        allTransactions.push(...successfulTransactions);
                    }

                    // Now, allTransactions array contains all the transactions from both users
                    //console.log(allTransactions);
                    function calculateTotalAmount(transactions) {
                        return transactions.reduce((total, transaction) => total + transaction.amount, 0);
                    }

                    // Calculate the total amount from allTransactions
                    const totalAmount = calculateTotalAmount(allTransactions);
                    // Display the total amount
                    console.log("Total Amount from All Transactions:", totalAmount);
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, totalAmount)

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

async function getSuccessfulMerchantTransactions(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions()
                    // console.log(response)
                    const allTransactions = [];

                    // Iterate through each user and their transactions
                    for (const user of response) {
                        const successfulTransactions = user.transactions.filter(transaction => transaction.status === 'success');
                        allTransactions.push(...successfulTransactions);
                    }

                    // Now, allTransactions array contains all the transactions from both users
                    //console.log(allTransactions);

                    // Display the total amount
                    console.log("Total Transactions:", allTransactions.length);
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, allTransactions.length)

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
async function settleMoney(details) {
    return await validateRequest(details)
        .then(async (response) => {
            console.log(response)
            // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
            if (response == true) {
                console.log(details)
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);

                const query = {
                    emailId: details.email_Id
                }
                const updateDetails = {

                    amount: details.amount,
                    currency: details.currency,
                    country: details.country ? details.country : '',
                    transaction_date: today.toISOString(),
                    ref_no: details.ref_no,
                    notes: details.notes
                }
                let adminQuery = {
                    emailId: details.emailId
                }
                const admin = await dao.getUserDetails(adminQuery)
                const user = await dao.getUserBalance(query)
                let checkObj = {
                    totalAmount: (Number(details.amount) + (Number(details.amount) / Number(user.platformFee)))
                };
                console.log(checkObj.totalAmount)
                if (Number(user.balance) < Number(details.amount)) {
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, 'Low merchant balance')
                }
                if (Number(checkObj.totalAmount) > Number(user.balance)) {
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, 'Low merchant balance')
                }

                return dao.updateSettlement(query, updateDetails)
                    .then((response) => {
                        if (response) {
                            return dao.getUserBalance(query)
                                .then((response) => {
                                    //console.log(response)
                                    const balance = response.balance
                                    if (Number(balance) < Number(details.amount)) {
                                        return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, 'Low merchant balance')
                                    }
                                    console.log(balance)
                                    let query = {
                                        emailId: details.email_Id
                                    }
                                    const adminProfit = (Number(details.amount) / Number(response.platformFee))
                                    console.log(adminProfit)
                                    let updateObj = {
                                        balance: Number(balance) - (Number(details.amount) + (Number(details.amount) / Number(response.platformFee)))
                                    };
                                    dao.updateProfile(adminQuery, {
                                        feeCollected24hr: admin.feeCollected24hr + adminProfit,
                                        totalFeeCollected: admin.totalFeeCollected + adminProfit
                                    })
                                    return dao.updateUserProfile(query, updateObj).then((userUpdated) => {
                                        if (userUpdated) {

                                            console.log('user updated')
                                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Settlement Updated')
                                        } else {
                                            return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, 'Failed to settle user')

                                        }

                                    })
                                })
                        }
                        else
                            return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, 'Failed to settle user')

                    })

            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
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
            transactionId: details.Data.PinWalletTransactionId
        }
        let updateObj = {
            status: details.Data.TxnStatus.toLowerCase(),
            utr: details.transaction_ref_no,

        }

        let adminQuery = {
            emailId: 'samir123@payhub'
        }
        const admin = await dao.getUserDetails(adminQuery)
        if (details.Data.PayerAmount && details.Data.TxnStatus.toLowerCase() == 'success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance', response[0].balance)
                    const balance = response[0].balance
                    const user24hr = response[0].last24hr
                    const yesterday = response[0].yesterday

                    console.log(balance)

                    let updateObj = {
                        balance: Number(details.Data.PayerAmount) + Number(balance),
                        last24hr: Number(user24hr) + Number(details.Data.PayerAmount),
                        utr: details.transaction_ref_no,
                        totalTransactions: Number(response[0].totalTransactions) + 1,
                        successfulTransactions: Number(response[0].successfulTransactions) + 1,
                        last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
                        last24hrTotal: Number(response[0].last24hrTotal) + 1,
                    }
                    const admin24hr = admin.last24hr
                    const adminBalance = admin.balance
                    let adminUpdate = {
                        last24hr: Number(admin24hr) + Number(details.Data.PayerAmount),
                        balance: Number(adminBalance) + Number(details.Data.PayerAmount),
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        successfulTransactions: Number(admin.successfulTransactions) + 1,
                        last24hrSuccess: Number(admin.last24hrSuccess) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    dao.updateProfile(adminQuery, adminUpdate)

                    dao.updateUserProfile2(query, updateObj)
                    callbackPayin(details, response[0].callbackUrl)

                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        } else {
            dao.getUserBalance2(query)
                .then((response) => {
                    // console.log('My balance',response[0].balance)
                    // const balance = response[0].balance
                    // console.log(balance)

                    // let updateObj = {
                    //     balance: Number(details.Data.PayerAmount) + Number(balance)
                    // }
                    let adminUpdate = {
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    updateObj.totalTransactions = Number(response[0].totalTransactions) + 1
                    updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1,

                        dao.updateUserProfile2(query, updateObj)
                    dao.updateProfile(adminQuery, adminUpdate)
                    callbackPayin(details, response[0].callbackUrl)

                })
        }

        return dao.updateTransactions(query, details.Data.PinWalletTransactionId, updateObj).then((userUpdated) => {
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

async function saveTxBazapay(details) {
    // return validateRequest(details)
    //     .then((response) => {
    if (details) {
        console.log('bazarpay', details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status,
            utr: details.transaction_ref_no
        }
        let adminQuery = {
            emailId: 'samir123@payhub'
        }
        const admin = await dao.getUserDetails(adminQuery)
        const gatewayData = await adminDao.getGatewayDetails('bazarpay')

        if (details.amount && details.status.toLowerCase() == 'success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance', response[0].balance)
                    const balance = response[0].balance
                    const user24hr = response[0].last24hr
                    const yesterday = response[0].yesterday
                    const admin24hr = admin.last24hr
                    const adminBalance = admin.balance
                    let adminUpdate = {
                        last24hr: Number(admin24hr) + Number(details.amount),
                        balance: Number(adminBalance) + Number(details.amount),
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        successfulTransactions: Number(admin.successfulTransactions) + 1,
                        last24hrSuccess: Number(admin.last24hrSuccess) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,

                    }
                    console.log(response[0].callbackUrl)
                    console.log(balance)
                    const feeCollected = Number(gatewayData.feeCollected24hr) + (Number(details.amount) / Number(response[0].platformFee))
                    const totalFeeCollected = Number(gatewayData.totalFeeCollected) + (Number(details.amount) / Number(response[0].platformFee))

                    let gatewayUpdate = {
                        last24hr: Number(gatewayData.last24hr) + Number(details.amount),
                        last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
                        successfulTransactions: Number(gatewayData.successfulTransactions) + 1,
                        totalVolume: Number(gatewayData.totalVolume) + Number(details.amount),
                        feeCollected24hr: feeCollected,
                        totalFeeCollected: totalFeeCollected,
                    }

                    let updateObj = {
                        balance: Number(details.amount) + Number(balance),
                        utr: details.transaction_ref_no,
                        last24hr: Number(user24hr) + Number(details.amount),
                        totalTransactions: Number(response[0].totalTransactions) + 1,
                        successfulTransactions: Number(response[0].successfulTransactions) + 1,
                        last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
                        last24hrTotal: Number(response[0].last24hrTotal) + 1,
                        // yesterday: Number(yesterday) + Number(details.amount)
                    }
                    let callBackDetails = {
                        transaction_id: details.transaction_id,
                        status: details.status,
                        amount: details.amount,
                        date: details.transaction_date
                    }
                    console.log(callBackDetails)
                    console.log(updateObj)
                    console.log(adminUpdate)
                    dao.updateProfile(adminQuery, adminUpdate)
                    dao.updateUserProfile2(query, updateObj)
                    dao.updateGatewayDetails('bazarpay', gatewayUpdate)

                    callbackPayin(callBackDetails, response[0].callbackUrl)
                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        } else {
            dao.getUserBalance2(query)
                .then((response) => {
                    // console.log('My balance',response[0].balance)
                    // const balance = response[0].balance
                    // console.log(response[0].callbackUrl)
                    // console.log(balance)

                    // let updateObj = {
                    //     balance: Number(details.amount) + Number(balance)
                    // }
                    let adminUpdate = {
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    updateObj.totalTransactions = Number(response[0].totalTransactions) + 1
                    updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1
                    let callBackDetails = {
                        transaction_id: details.transaction_id,
                        status: details.status,
                        amount: details.amount,
                        date: details.transaction_date
                    }
                    console.log(callBackDetails)
                    console.log(updateObj)
                    dao.updateProfile(adminQuery, adminUpdate)
                    dao.updateUserProfile2(query, updateObj)
                    callbackPayin(callBackDetails, response[0].callbackUrl)
                })
        }

        return dao.updateTransactions(query, details.transaction_id, updateObj).then((userUpdated) => {
            if (userUpdated) {
                // console.log('success', userUpdated)

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

async function saveTxIntentpay(details) {
    // return validateRequest(details)
    //     .then((response) => {
    if (details) {
        console.log('intentpay', details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status
        }
        if (details.amount) {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance', response[0].balance)
                    const balance = response[0].balance
                    console.log(balance)

                    let updateObj = {
                        balance: Number(details.amount) + Number(balance)
                    }
                    dao.updateUserProfile2(query, updateObj)
                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        }

        return dao.updateTransactions(query, details.transaction_id, updateObj).then((userUpdated) => {
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

async function saveTxPaythrough(details) {
    // return validateRequest(details)
    //     .then((response) => {
    if (details) {
        console.log('paythrough', details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status,
            utr: details.invoice_id,

        }
        let adminQuery = {
            emailId: 'samir123@payhub'
        }
        const transaction = await dao.getTransactionDetails(details.transaction_id)
        console.log(transaction)
        const admin = await dao.getUserDetails(adminQuery)
        const gatewayData = await adminDao.getGatewayDetails('paythrough')

        if (details.total_amount && details.status == 'success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance', response[0].balance)
                    const balance = response[0].balance
                    const user24hr = response[0].last24hr
                    const yesterday = response[0].yesterday
                    const admin24hr = admin.last24hr
                    const adminBalance = admin.balance
                    let adminUpdate = {
                        last24hr: Number(admin24hr) + Number(details.total_amount),
                        balance: Number(adminBalance) + Number(details.total_amount),
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        successfulTransactions: Number(admin.successfulTransactions) + 1,
                        last24hrSuccess: Number(admin.last24hrSuccess) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    const feeCollected = Number(gatewayData.feeCollected24hr) + (Number(details.total_amount) / Number(response[0].platformFee))
                    const totalFeeCollected = Number(gatewayData.totalFeeCollected) + (Number(details.total_amount) / Number(response[0].platformFee))
                    let gatewayUpdate = {
                        last24hr: Number(gatewayData.last24hr) + Number(details.total_amount),
                        last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
                        successfulTransactions: Number(gatewayData.successfulTransactions) + 1,
                        totalVolume: Number(gatewayData.totalVolume) + Number(details.total_amount),
                        feeCollected24hr: feeCollected,
                        totalFeeCollected: totalFeeCollected,
                    }
                    console.log(balance)

                    let updateObj = {
                        balance: Number(details.total_amount) + Number(balance),
                        utr: details.invoice_id,
                        last24hr: Number(user24hr) + Number(details.total_amount),
                        totalTransactions: Number(response[0].totalTransactions) + 1,
                        successfulTransactions: Number(response[0].successfulTransactions) + 1,
                        last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
                        last24hrTotal: Number(response[0].last24hrTotal) + 1,
                    }
                    let callBackDetails = {
                        transaction_id: details.transaction_id,
                        status: details.status,
                        amount: details.total_amount,
                        date: transaction.transaction_date
                    }
                    console.log('callback details', callBackDetails)
                    dao.updateProfile(adminQuery, adminUpdate)
                    dao.updateUserProfile2(query, updateObj)
                    dao.updateGatewayDetails('paythrough', gatewayUpdate)
                    callbackPayin(callBackDetails, response[0].callbackUrl)

                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        } else {
            dao.getUserBalance2(query)
                .then((response) => {
                    // console.log('My balance',response[0].balance)
                    // const balance = response[0].balance
                    // console.log(response[0].callbackUrl)
                    // console.log(balance)

                    // let updateObj = {
                    //     balance: Number(details.amount) + Number(balance)
                    // }
                    let callBackDetails = {
                        transaction_id: details.transaction_id,
                        status: details.status,
                        amount: details.total_amount,
                        date: transaction.transaction_date
                    }

                    console.log('callback details', callBackDetails)
                    let adminUpdate = {
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    updateObj.totalTransactions = Number(response[0].totalTransactions) + 1
                    updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1,


                        dao.updateProfile(adminQuery, adminUpdate)

                    dao.updateUserProfile2(query, updateObj)

                    callbackPayin(callBackDetails, response[0].callbackUrl)

                })
        }

        return dao.updateTransactions(query, details.transaction_id, updateObj).then((userUpdated) => {
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

async function saveTxAirpay(details) {
    console.log('Airpay', details)
    console.log('type', typeof (details.TRANSACTIONID))
    // return validateRequest(details)
    //     .then((response) => {
    if (details) {
        const query = {
            transactionId: details.APTRANSACTIONID
        }
        let updateObj = {
            status: details.TRANSACTIONPAYMENTSTATUS.toLowerCase(),
            utr: details.TRANSACTIONID,

        }
        let adminQuery = {
            emailId: 'samir123@payhub'
        }
        const transaction = await dao.getTransactionDetails(details.APTRANSACTIONID)
        // console.log(transaction)
        const admin = await dao.getUserDetails(adminQuery)
        const gatewayData = await adminDao.getGatewayDetails('airpay')
        console.log(gatewayData)
        if (details.AMOUNT && details.TRANSACTIONPAYMENTSTATUS == 'SUCCESS') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance', response[0].balance)
                    const balance = response[0].balance
                    const user24hr = response[0].last24hr
                    const yesterday = response[0].yesterday
                    const admin24hr = admin.last24hr
                    const adminBalance = admin.balance
                    let adminUpdate = {
                        last24hr: Number(admin24hr) + Number(details.AMOUNT),
                        balance: Number(adminBalance) + Number(details.AMOUNT),
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        successfulTransactions: Number(admin.successfulTransactions) + 1,
                        last24hrSuccess: Number(admin.last24hrSuccess) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    const feeCollected = Number(gatewayData.feeCollected24hr) + (Number(details.AMOUNT) / Number(response[0].platformFee))
                    const totalFeeCollected = Number(gatewayData.totalFeeCollected) + (Number(details.AMOUNT) / Number(response[0].platformFee))
                    console.log(feeCollected, totalFeeCollected)
                    let gatewayUpdate = {
                        last24hr: Number(gatewayData.last24hr) + Number(details.AMOUNT),
                        last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
                        successfulTransactions: Number(gatewayData.successfulTransactions) + 1,
                        totalVolume: Number(gatewayData.totalVolume) + Number(details.AMOUNT),
                        feeCollected24hr: feeCollected,
                        totalFeeCollected: totalFeeCollected,
                    }
                    console.log('gateway update', gatewayUpdate)

                    let updateObj = {
                        balance: Number(details.AMOUNT) + Number(balance),
                        utr: details.TRANSACTIONID,
                        last24hr: Number(user24hr) + Number(details.AMOUNT),
                        totalTransactions: Number(response[0].totalTransactions) + 1,
                        successfulTransactions: Number(response[0].successfulTransactions) + 1,
                        last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
                        last24hrTotal: Number(response[0].last24hrTotal) + 1,
                    }
                    console.log("updateObj", updateObj)
                    let callBackDetails = {
                        transaction_id: details.APTRANSACTIONID,
                        status: details.TRANSACTIONPAYMENTSTATUS,
                        amount: details.AMOUNT,
                        date: transaction.transaction_date
                    }
                    console.log('callback details', callBackDetails)
                    dao.updateProfile(adminQuery, adminUpdate)
                    dao.updateUserProfile2(query, updateObj)
                    dao.updateGatewayDetails('airpay', gatewayUpdate)
                    callbackPayin(callBackDetails, response[0].callbackUrl)

                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        } else {
            dao.getUserBalance2(query)
                .then((response) => {
                    // console.log('My balance',response[0].balance)
                    // const balance = response[0].balance
                    // console.log(response[0].callbackUrl)
                    // console.log(balance)

                    // let updateObj = {
                    //     balance: Number(details.amount) + Number(balance)
                    // }
                    let callBackDetails = {
                        transaction_id: details.APTRANSACTIONID,
                        status: details.TRANSACTIONPAYMENTSTATUS,
                        amount: details.AMOUNT,
                        date: transaction.transaction_date
                    }

                    console.log('callback details', callBackDetails)
                    let adminUpdate = {
                        totalTransactions: Number(admin.totalTransactions) + 1,
                        last24hrTotal: Number(admin.last24hrTotal) + 1,
                    }
                    updateObj.totalTransactions = Number(response[0].totalTransactions) + 1
                    updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1,


                        dao.updateProfile(adminQuery, adminUpdate)

                    dao.updateUserProfile2(query, updateObj)

                    callbackPayin(callBackDetails, response[0].callbackUrl)

                })
        }

        return dao.updateTransactions(query, details.APTRANSACTIONID, updateObj).then((userUpdated) => {
            if (userUpdated) {
                //console.log('success', userUpdated)

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


async function updateGateway(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }
                let updateDetails = {
                    gateway: details.gateway
                }

                return dao.updateUserGateway(query, updateDetails).then((userUpdated) => {
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

async function updateGatewayPremium(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }
                let updateDetails = {
                    premiumGateway: details.premiumGateway
                }

                return dao.updateUserGateway(query, updateDetails).then((userUpdated) => {
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

async function updatePremium(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }
                let updateDetails = {
                    premium: details.premium.toString()
                }
                console.log(updateDetails)
                return dao.updateUserProfile(query, updateDetails).then((userUpdated) => {
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

async function updateGatewayData(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }
                let updateDetails = {
                    gatewayName: details.gatewayName,
                    last24hr: 0,
                    yesterday: 0,
                    totalVolume: 0,
                    successfulTransactions: 0,
                    last24hrSuccess: 0,
                    last24hrTotal: 0,
                    totalTransactions: 0,
                    platformFee: 0,
                    feeCollected24hr: 0,
                    totalFeeCollected: 0,
                    yesterdayFee: 0,
                    yesterdayTransactions: 0,
                    collectionFee: 0,
                    payoutFee: 0,
                    abbr: details.abbr
                }
                console.log(updateDetails)
                return dao.updateGatewayData(query, updateDetails).then((userUpdated) => {
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


async function getDataByUtr(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }

                return dao.getUser(query).then((user) => {
                    if (user) {
                        console.log('success', user)
                        let filteredResponse = []
                        for (let i = 0; i < user.transactions.length; i++) {

                            if (user.transactions[i].utr == details.utr) {
                                filteredResponse.push(user.transactions[i]);
                                break;
                            }
                        }

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, filteredResponse)


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


async function getTransactionsUser(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {

                    emailId: details.email_Id,
                    limit: details.limit,
                    skip: details.skip

                }

                return dao.getUserTransactionsData(query).then((user) => {
                    if (user) {
                        console.log('success', user)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, user)


                    } else {

                        console.log("Failed to get data")
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

async function getTransactionsByStatus(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id,
                    status: details.status,
                    limit: details.limit,
                    skip: details.skip
                }

                return dao.getTransactionsByStatus(query).then((user) => {
                    if (user) {
                        console.log('success', user)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, user)


                    } else {

                        console.log("Failed to get data")
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


async function getTransactionsByDate(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id,

                }

                return dao.getTransactionByDate(query, details.start_date, details.end_date).then((user) => {
                    if (user) {
                        console.log('success', user)

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, user)


                    } else {

                        console.log("Failed to get data")
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




async function getAllMerchantTransactions(details) {
    try {
        if (details.emailId && details.apiKey) {
            const isValidRequest = await validateRequest(details);

            if (isValidRequest) {
                const response = await userDao.getAllUsersTransactions();
                let allTransactions = [];

                // Iterate through each user and their transactions
                for (const user of response) {
                    if (!user.business_name || !Array.isArray(user.transactions)) {
                        console.log(`Invalid user data: ${JSON.stringify(user)}`);
                        continue;
                    }

                    for (let i = 0; i < user.transactions.length; i++) {
                        let transaction = user.transactions[i];
                        const body = {
                            transactionId: transaction.transactionId,
                            merchant_ref_no: transaction.merchant_ref_no,
                            amount: transaction.amount,
                            currency: transaction.currency,
                            country: transaction.country,
                            status: transaction.status,
                            hash: transaction.hash,
                            payout_type: transaction.payout_type,
                            message: transaction.message,
                            transaction_date: transaction.transaction_date,
                            business_name: user.business_name,
                            utr: transaction.utr ? transaction.utr : ''
                        }
                        // Log relevant values for debugging

                        // Add the 'business_name' property to the transaction

                        // Log the modified transaction

                        // Add the modified transaction to the allTransactions array
                        allTransactions.push(body);
                    }
                }
                // Now, allTransactions array contains all the successful transactions from both users

                // Define pagination details
                // Apply pagination using slice
                const startIndex = details.skip;
                const endIndex = startIndex + details.limit;
                const reversed = allTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                const paginatedTransactions = reversed.slice(startIndex, endIndex);

                // Display the total amount and return the paginated results
                console.log("Total Transactions paginated:", paginatedTransactions.length);

                // Return the paginated results
                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, paginatedTransactions);
            } else {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey');
            }
        } else {
            return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details');
        }
    } catch (error) {
        console.error("Error in getAllMerchantTransactions:", error);
        return mapper.responseMapping(usrConst.CODE.InternalServerError, 'Internal Server Error');
    }
}

async function getAllMerchantsInfo(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions();
                    const allTransactions = [];

                    // Iterate through each user and their transactions
                    for (const user of response) {
                        const successfulTransactions = {
                            business_name: user.business_name,
                            email_id: user.emailId
                        }
                        //.filter(transaction => transaction.status === 'success');
                        allTransactions.push(successfulTransactions);
                    }

                    // Now, allTransactions array contains all the successful transactions from both users

                    // Define pagination details

                    // Apply pagination using slice
                    // const startIndex = details.skip;
                    // const endIndex = startIndex + details.limit;
                    // const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

                    // Display the total amount and return the paginated results
                    console.log("Total Transactions:", allTransactions.length);
                    // console.log("Paginated Transactions:", paginatedTransactions);

                    // Return the paginated results
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, allTransactions);


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

async function getMerchantTransactionByUtr(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions();
                    const allTransactions = [];

                    // Iterate through each user and their transactions
                    for (const user of response) {
                        const successfulTransactions = user.transactions
                        //.filter(transaction => transaction.status === 'success');
                        allTransactions.push(...successfulTransactions);
                    }

                    // Now, allTransactions array contains all the successful transactions from both users

                    // Define pagination details
                    // const details = {
                    //     skip: 0,      // Number of items to skip
                    //     limit: 10     // Number of items to display per page
                    // };

                    // // Apply pagination using slice
                    // const startIndex = details.skip;
                    // const endIndex = startIndex + details.limit;
                    // const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

                    // Display the total amount and return the paginated results
                    let filteredResponse = []
                    for (let i = 0; i < allTransactions.length; i++) {

                        if (allTransactions[i].utr == details.utr) {
                            filteredResponse.push(allTransactions[i]);
                            break;
                        }
                    }

                    console.log("Total Transactions:", filteredResponse.length);
                    // console.log("Paginated Transactions:", paginatedTransactions);

                    // Return the paginated results
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, filteredResponse);


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

async function getGatewayDetails(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    let query = {
                        emailId: details.emailId
                    }
                    const response = await dao.getUserDetails(query);
                    console.log(response)
                    let gatewayDetails = []

                    for (let i = 0; i < response.gateways.length; i++) {
                        let body = {
                            "gatewayName": response.gateways[i].gatewayName,
                            "last24hr": response.gateways[i].last24hr,
                            "yesterday": response.gateways[i].yesterday,
                            "totalVolume": response.gateways[i].totalVolume,
                            "successfulTransactions": response.gateways[i].successfulTransactions,
                            "last24hrSuccess": response.gateways[i].last24hrSuccess,
                            "last24hrTotal": response.gateways[i].last24hrTotal,
                            "totalTransactions": response.gateways[i].totalTransactions,
                            "platformFee": response.gateways[i].platformFee,
                            "feeCollected24hr": response.gateways[i].feeCollected24hr,
                            "totalFeeCollected": response.gateways[i].totalFeeCollected,
                            "yesterdayFee": response.gateways[i].yesterdayFee,
                            "yesterdayTransactions": response.gateways[i].yesterdayTransactions,
                            "todaysBalance": Number(response.gateways[i].last24hr) - Number(response.gateways[i].feeCollected24hr)
                        }
                        gatewayDetails.push(body)
                    }

                    console.log(gatewayDetails)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, gatewayDetails);


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

async function getGatewayInfo(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    let query = {
                        emailId: details.emailId
                    }
                    const response = await dao.getUserDetails(query);
                    console.log(response)
                    let gatewayDetails = []

                    for (let i = 0; i < response.gateways.length; i++) {
                        let body = {
                            "gatewayName": response.gateways[i].gatewayName,
                            "abbr": response.gateways[i].abbr,
                            "collectionFee": response.gateways[i].collectionFee,
                            "payoutFee": response.gateways[i].payoutFee,

                        }
                        gatewayDetails.push(body)
                    }

                    console.log(gatewayDetails)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, gatewayDetails);


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
                    if (Number(details.amount)) {
                        // let updatedBalance = balance - Number(details.amount)
                        // updateObj.balance = updatedBalance
                        // dao.updateProfile(query,updateObj)
                        let gateway = details.gateway
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
                        if (gateway == 'bazarpay') {
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

                        if (gateway == 'pinwallet') {
                            const token = await generatePinWalletToken()
                            console.log(token.data.token)
                            await pinwalletPayout(token.data.token)
                                .then((response) => {
                                    console.log(response)
                                })
                            return
                        }


                    } else {
                        // let updatedBalance = Number(details.amount)
                        // updateObj.balance = updatedBalance
                        // dao.updateProfile(query,updateObj)
                        return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'invalid input')

                    }
                })
            } else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return response
            }

        })
}

async function updateGatewayFee(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }
                let updateDetails = {
                    platformFee: details.platformFee
                }

                return dao.updateUserProfile(query, updateDetails).then((userUpdated) => {
                    if (userUpdated) {
                        // console.log('success', userUpdated)

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

async function updatePlatformFee(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.emailId
                }
                let updateDetails = {
                    platformFee: details.platformFee
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

async function updateGatewayFees(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = details.gatewayName
                let updateDetails = {
                    collectionFee: details.collectionFee,
                    payoutFee: details.payoutFee

                }

                return dao.updateGatewayFees(query, updateDetails).then((userUpdated) => {
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

async function getAllMerchantsStats(details) {
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    const response = await userDao.getAllUsersTransactions();
                    const allTransactions = [];

                    // Iterate through each user and their transactions
                    for (const user of response) {
                        const successfulTransactions = {
                            merchant_name: user.business_name,
                            emailId: user.emailId,
                            todaysVolume: user.last24hr,
                            todaysTransaction: user.last24hrSuccess,
                            yesterdaysVolume: user.yesterday,
                            balance: user.balance
                        }
                        //.filter(transaction => transaction.status === 'success');
                        allTransactions.push(successfulTransactions);
                    }

                    // Now, allTransactions array contains all the successful transactions from both users

                    // Define pagination details

                    // Apply pagination using slice
                    // const startIndex = details.skip;
                    // const endIndex = startIndex + details.limit;
                    // const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

                    // Display the total amount and return the paginated results
                    console.log("Total Transactions:", allTransactions.length);
                    // console.log("Paginated Transactions:", paginatedTransactions);

                    // Return the paginated results
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, allTransactions);


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

async function getMerchantData(details) {

    if (!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
    const query = {
        emailId: details.emailId
    }
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {

                    let userQuery = {
                        emailId: details.email_Id
                    }

                    const user = await dao.getMerchantDetails(userQuery)
                    console.log(user)
                    const totalTransactions = user.last24hrTotal
                    const SuccessfulTransactions = user.last24hrSuccess
                    const successRate = (Number(SuccessfulTransactions) / Number(totalTransactions)) * 100
                    console.log(totalTransactions, SuccessfulTransactions, successRate)
                    let responseData = {
                        // totalTransactions,
                        // successfulTransactions: SuccessfulTransactions,
                        // successRate: successRate ? successRate : 0,
                        yesterday: user.yesterday,
                        balance: user.balance,
                        last24hr: user.last24hr,
                        emailId: user.emailId,
                        business_name: user.business_name,
                        first_name: user.first_name,
                        last_name: user.last_name ? user.last_name : ''


                    }
                    console.log('admin data', responseData)
                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, responseData)

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
async function getUserSettlements(details) {
    if (!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
    const query = {
        emailId: details.emailId
    }
    if (details.emailId && details.apiKey) {
        return await validateRequest(details)
            .then(async (response) => {
                if (response == true) {
                    // if (!details.emailId) return mapper.responseMapping(usrConst.CODE.BadRequest, 'Invalid details')
                    const query = {
                        emailId: details.email_Id
                    }
                    const response = await dao.getAllUserTransactions(query)
                   // console.log(response)
                    let allTx =[]
                    const settlements = response.settlements
                    settlements.map((item,index)=>{
                        let body = {
                            "amount": item.amount,
                            "currency": item.currency,
                            "country": item.country,
                            "transaction_date": item.transaction_date,
                            "ref_no": item.ref_no,
                            "notes": item.notes,
                            "txIndex":index
                        }
                       // body.txIndex = index
                        allTx.push(body)
                    })
                    console.log(allTx)
                    const startIndex = details.skip;
                    const endIndex = startIndex + details.limit;
                    const reversed = allTx.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                    const paginatedTransactions = reversed.slice(startIndex, endIndex);


                    if (response)
                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, paginatedTransactions)
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

async function getMerchantTransactionsByDate(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id,

                }

                return dao.getTransactionByDate(query, details.start_date, details.end_date).then((user) => {
                    if (user) {
                        console.log('success', user)
                        const startIndex = details.skip;
                        const endIndex = startIndex + details.limit;
                        const reversed = user.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                        const paginatedTransactions = reversed.slice(startIndex, endIndex);

                        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, paginatedTransactions)


                    } else {

                        console.log("Failed to get data")
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



module.exports = {



    register,

    login,

    resetPassword,

    getAllUserTransactions,

    getAllUsersTransactions,

    getProfileData,

    updateUserProfile,

    saveTx,

    saveTxBazapay,

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

    updateGatewayFees,

    saveTxAirpay,

    getAllMerchantsStats,

    getMerchantData,

    getAllUserTx,

    getUserSettlements,

    getMerchantTransactionsByDate

}
