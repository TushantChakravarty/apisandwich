const mongoose = require('mongoose')
const constants = require('../../constants')
const appUtil = require('../../appUtils')

// verified : email verification
// isIdentityVerified : blinking verification


/*const Schema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String, index: { unique: false } },
    contactNumber: { type: String, index: { unique: false } },
    password: { type: String, required: true },
    address: { type: String },
     OTP: { type: String },
    isOTPVerified: { type: Boolean, default: false },
    walletAddress: { type: String },
   
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USERS },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USERS },
    isLoggedOut: { type: Boolean, default: false },
    token: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otpUpdatedAt: { type: Date, default: null }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})*/

const Schema = new mongoose.Schema({
    emailId: { type: String, index: { unique: true } },
    first_name:{type:String},
    last_name:{type:String},
    business_name:{type:String},
    business_type:{type:String},
    apiKey: { type: String, required: true },
    phone: { type: String },
    password:{type:String},
    token:{type:String},
    balance:{type:Number},
    gateway:{type:String},
    callbackUrl:{type:String},
    redirectUrl:{type:String},
    premium:{type:String},
    premiumGateway:{type:String},
    last24hr:{type:String},
    last24hrSuccess:{type:String},
    last24hrTotal:{type:String},
    yesterday:{type:String},
    successfulTransactions:{type:String},
    totalTransactions:{type:String},
    platformFee:{type:Number},
    transactions:[
        {
            transactionId:{type:String},
            merchant_ref_no: {type:String},
    amount:{type:Number},
    currency: {type:String},
    country: {type:String},
    status: {type:String},
    hash: {type:String},
    payout_type: {type:String},
    message: {type:String},
    transaction_date:{type:String},
    gateWay:{type:String},
    utr:{type:String}

        }
    ],
    settlements:[
        {
    
    amount:{type:Number},
    currency: {type:String},
    country: {type:String},
    transaction_date:{type:String},
    notes:{type:String},
    ref_no:{type:String}
        }
    ]
   
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.USERS, Schema);
