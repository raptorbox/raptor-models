const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('../helper/logger')
const errors = require('../helper/errors')

const Profile = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: require('uuid/v4'),
        index: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true
    },
    value: {
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

Profile.methods.merge = function(p) {

    const prof = this

    return Promise.resolve()
        .then(() => {

            if (p.userId) {
                prof.userId = p.userId
            }

            if (p.name) {
                prof.name = p.name
            }

            if(p.value) {
                prof.value = p.value
            }

            return Promise.resolve()
        })
        .then(() => {
            return Promise.resolve(prof)
        })
}

module.exports = mongoose.model('Profile', Profile, 'profile')
