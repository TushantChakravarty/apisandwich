
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
                    let query ={
                        emailId:details.email_Id
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
                    let query ={
                        emailId:details.email_Id
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
    if (isWithinLastWeek(transactionDate)) {
        weeklyTransactions.push(transaction);
    }
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
  
  // Now you have the three objects with the specified structure, considering only 'success' status transactions
//   console.log("Yesterday's Object:", yesterdayObject);
//   console.log("Today's Object:", todayObject);
//   console.log("Weekly Object:", weeklyObject);
let responseData= {
    yesterdayObject,
    todayObject,
    weeklyObject
}
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
                        country: details.country,
                        transaction_date: today.toISOString(),
                        
                    }
                   
                    
                   return dao.updateSettlement(query, updateDetails)
                   .then((response)=>{
                    if(response)
                    {
                       return dao.getUserBalance(query)
                        .then((response) => {
                            console.log(response)
                            const balance = response.balance
                            if(Number(balance)<Number(details.amount))
                            {
                                return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails, 'Low merchant balance')
                            }
                            console.log(balance)
                            let query = {
                                emailId: details.email_Id
                            }
                            let updateObj = {
                                balance: Number(balance) - Number(details.amount)
                            }
                           return dao.updateUserProfile(query, updateObj).then((userUpdated) => {
                                if(userUpdated)
                                {

                                    console.log('user updated')
                                    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, 'Settlement Updated')
                                }else{
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
            status: details.Data.TxnStatus.toLowerCase()
        }
        if (details.Data.PayerAmount &&  details.Data.TxnStatus.toLowerCase()=='success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance',response[0].balance)
                    const balance = response[0].balance
                    console.log(balance)
                   
                    let updateObj = {
                        balance: Number(details.Data.PayerAmount) + Number(balance)
                    }
                    dao.updateUserProfile2(query, updateObj)
                    callbackPayin(details,response[0].callbackUrl)

                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        }else{
            dao.getUserBalance2(query)
            .then((response) => {
                // console.log('My balance',response[0].balance)
                // const balance = response[0].balance
                // console.log(balance)
               
                // let updateObj = {
                //     balance: Number(details.Data.PayerAmount) + Number(balance)
                // }
                dao.updateUserProfile2(query, updateObj)
                callbackPayin(details,response[0].callbackUrl)

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
        console.log('bazarpay',details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status
        }
        if (details.amount&&details.status.toLowerCase()=='success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance',response[0].balance)
                    const balance = response[0].balance
                    console.log(response[0].callbackUrl)
                    console.log(balance)
                   
                    let updateObj = {
                        balance: Number(details.amount) + Number(balance)
                    }
                    dao.updateUserProfile2(query, updateObj)
                    callbackPayin(details,response[0].callbackUrl)
                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        }else{
            dao.getUserBalance2(query)
            .then((response) => {
                // console.log('My balance',response[0].balance)
                // const balance = response[0].balance
                // console.log(response[0].callbackUrl)
                // console.log(balance)
               
                // let updateObj = {
                //     balance: Number(details.amount) + Number(balance)
                // }
                dao.updateUserProfile2(query, updateObj)
                callbackPayin(details,response[0].callbackUrl)
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
        console.log('intentpay',details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status
        }
        if (details.amount) {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance',response[0].balance)
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
        console.log('paythrough',details)
        const query = {
            transactionId: details.transaction_id
        }
        let updateObj = {
            status: details.status
        }
        if (details.total_amount&&details.status=='success') {
            dao.getUserBalance2(query)
                .then((response) => {
                    console.log('My balance',response[0].balance)
                    const balance = response[0].balance
                    console.log(balance)
                   
                    let updateObj = {
                        balance: Number(details.total_amount) + Number(balance)
                    }
                    dao.updateUserProfile2(query, updateObj)
                    callbackPayin(details,response[0].callbackUrl)

                })
            // updateObj.balance = details.PayerAmount
            // let updatedBalance = details.balance
            // updateObj.balance = updatedBalance
            //  dao.updateProfile(query, updateObj)
        }else{
            dao.getUserBalance2(query)
            .then((response) => {
                // console.log('My balance',response[0].balance)
                // const balance = response[0].balance
                // console.log(response[0].callbackUrl)
                // console.log(balance)
               
                // let updateObj = {
                //     balance: Number(details.amount) + Number(balance)
                // }
                dao.updateUserProfile2(query, updateObj)
                callbackPayin(details,response[0].callbackUrl)

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

async function updateGateway(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                const query = {
                    emailId: details.email_Id
                }
            let updateDetails={
                gateway:details.gateway
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
            let updateDetails={
                premiumGateway:details.premiumGateway
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
            let updateDetails={
                premium:details.premium.toString()
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

    updateGatewayPremium

}
