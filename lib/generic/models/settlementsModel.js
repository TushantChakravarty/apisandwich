const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const requestSchema = new Schema({
    uuid:{type:String},
    amount: { type: Number },
    currency: { type: String },
    country: { type: String },
    transaction_date: { type: String },
    notes: { type: String },
    ref_no: { type: String },
    feeCharged: { type: Number },
    feePercentage:{ type: Number },
    netFees:{ type: Number },
    amountSettled: { type: Number },
    usdt: {type:Number},
    usdtRate:{ type: Number }
});

module.exports= mongoose.model('Settlements', requestSchema);