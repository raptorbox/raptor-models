
const mongoose = require('mongoose')
const AppUser = require('./app_user')
const Schema = mongoose.Schema

var AppDelta = new Schema({
    deletedUsers: {
        type: [AppUser.schema],
        default: []
    },
    userOldRoles: {
        type: [AppUser.schema],
        default: []
    },
    deleteDevices: {
        type: [String],
        default: []
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

module.exports.schema = AppDelta
