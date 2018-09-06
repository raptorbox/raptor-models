
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('../helper/logger')
const errors = require('../helper/errors')

var Action = new Schema({
    id: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        // required: true
    },
    description: {
        type: String
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

module.exports = mongoose.model('Action', Action)
