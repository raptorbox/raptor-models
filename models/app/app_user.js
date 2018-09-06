
const mongoose = require('mongoose')
const Schema = mongoose.Schema

var AppUser = new Schema({
    id: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    roles: {
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

AppUser.methods.isOwner = function(app) {
    return this.id === app.userId
}

module.exports.schema = AppUser
