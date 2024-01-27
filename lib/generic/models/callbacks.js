const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    transactionId: { type: String, index: { unique: true } },
    gateway: { type: String, index: { unique: true } },
    callbackTime: { type: String, index: { unique: true } },
    otherFields: mongoose.Schema.Types.Mixed  // Dynamic field for additional data
}, {
    versionKey: false,
    timestamps: true,
    strict: false  // Allow dynamic addition of fields
});

module.exports = mongoose.model("Callbacks", Schema);