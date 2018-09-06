
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('../helper/logger')
const errors = require('../helper/errors')

var Location = new Schema({
    type: {
        type: String,
        required: true
    },
    coordinates: [Number]
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

module.exports = mongoose.model('Location', Location)
