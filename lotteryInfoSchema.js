'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lotteryInfoSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    amount: {
        type: Number
    }
});


mongoose.Promise = global.Promise;
module.exports = mongoose.model('lotteryInfo', lotteryInfoSchema);