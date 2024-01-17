const mongoose = require("mongoose");
const constants = require("../../constants");
const appUtil = require("../../appUtils");

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

const Schema = new mongoose.Schema(
  {
    emailId: { type: String, index: { unique: true } },
    apiKey: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String },
    balance: { type: Number },
    gateway: { type: String },
    last24hr: { type: String },
    yesterday: { type: String },
    totalVolume: { type: String },
    successfulTransactions: { type: String },
    last24hrSuccess: { type: String },
    last24hrTotal: { type: String },
    totalTransactions: { type: String },
    platformFee: { type: Number },
    feeCollected24hr: { type: Number },
    totalFeeCollected: { type: Number },
    lastExecutionDate: { type: String },
    gateways: [
      {
        gatewayName: { type: String },
        last24hr: { type: String },
        yesterday: { type: Number },
        totalVolume: { type: Number },
        successfulTransactions: { type: Number },
        last24hrSuccess: { type: Number },
        last24hrTotal: { type: Number },
        totalTransactions: { type: Number },
        platformFee: { type: Number },
        feeCollected24hr: { type: Number },
        totalFeeCollected: { type: Number },
        yesterdayFee: { type: Number },
        yesterdayTransactions: { type: Number },
        collectionFee: { type: Number },
        payoutFee: { type: Number },
        abbr: { type: String },
        balance: { type: Number },
        settlements: { type: Number },
        hash: { type: String },
        switch: { type: Boolean },
        payouts: {
          last24hr: { type: String },
          last24hrSuccess: { type: String },
          last24hrTotal: { type: String },
          yesterday: { type: String },
          yesterdayTransactions: { type: String },
          successfulTransactions: { type: String },
          totalTransactions: { type: String },
        },
      },
    ],
    gatewaySettlements: [
      {
        gatewayName: { type: String },
        amount: { type: Number },
        gst: { type: Number },
        ref: { type: String },
        notes: { type: String },
        transaction_date: { type: String },
      },
    ],
  },
  {
    versionKey: false,
    timeStamp: true,
    strict: true,
  }
);

module.exports = mongoose.model("admin", Schema);
