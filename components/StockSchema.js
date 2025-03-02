const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    stockNfuc: {
        type: Number,
        required: true
    },
    lastClaim: {
        type: Date,
        default: Date.now
    },
    days: {
        type: Number,
        default: 0
    },
    endDate:{
        type:Date,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock;
