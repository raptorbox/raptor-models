
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuthorizationCode = new Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    redirectUri: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('AuthorizationCode', AuthorizationCode)
