// models/Post.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    heading: {
        type: String,
        default:'empty'
    },
    appIcon: {
        type: String,
        default:'empty'
    },
    ad: {
        type: String,
        default:'empty'
    },
    facebook: {
        type: String,
        default:'empty'
    },
    whatsapp: {
        type: String,
        default:'empty'
    },
    instagram: {
        type: String,
        default:'empty'
    },
    twitter: {
        type: String,
        default:'empty'
    },
    tiktok: {
        type: String,
        default:'empty'
    },
    youtube: {
        type: String,
        default:'empty'
    },
    telegram: {
        type: String,
        default:'empty'
    },
    discord: {
        type: String,
        default:'empty'
    },
    version: {
        type: Number,
    },
    telegramSupport: {
        type: String,
        default: 'empty'
    },
    binanceId: {
        type: String,
        default: 'empty'
    },
    okxId: {
        type: String,
        default: 'empty'
    },
});

const Asset = mongoose.model('assetSchema', assetSchema);

module.exports = Asset;
