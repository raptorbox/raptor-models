
const mongoose = require('mongoose')
const Schema = mongoose.Schema

var AppRole = new Schema({
    name: {
        type: String,
        required: true
    },
    permissions: {
        type: [String]
    },
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

module.exports.schema = AppRole
