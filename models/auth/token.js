var mongoose = require('mongoose')
var Schema = mongoose.Schema
const rand = require('./plugin/random')
const config = require('../config')
const uuidv4 = require('uuid/v4')
const logger = require('../../helper/logger')
const errors = require('../../helper/errors')

const tokenTime = 3600
const getDefaultExpires = () => new Date(Date.now() + (tokenTime * 1000))
const checkDate = (expires) => {

    if(expires === null) {
        expires = getDefaultExpires()
    }

    if(expires === 0) {
        return null
    } else {
        // is numeric
        if(expires * 1 == expires) {
            return new Date(expires * 1000)
        } else if (expires instanceof Date) {
            return expires
        }
    }

    return getDefaultExpires()
}

var Token = new Schema({
    id: {
        type: String,
        index: true,
        required: false,
        unique: true,
        default: uuidv4
    },
    name: {
        type: String,
        index: true,
        required: true,
    },
    token: {
        type: String,
        index: true,
        unique: true,
        required: false,
    },
    secret: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: false,
        index: true,
        default: 'DEFAULT'
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true,
    },
    willExpire: {
        type: Boolean,
        required: false,
        default: false,
    },
    expires: {
        type: Date,
        required: false,
        // +30 min
        default: getDefaultExpires,
        set: checkDate
    },
    userId: {
        type: String,
        ref: 'User',
        index: true,
        required: true,
    },
    clientId: {
        type: String,
        ref: 'Client',
        index: true,
        required: false,
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
            if(ret.expires) {
                ret.expires = Math.round((new Date(ret.expires).getTime() / 1000)+1) //add 1sec to avoid rounding issue
            }
        }
    }
})

Token.plugin(require('../plugin/pager'))
Token.plugin(require('./plugin/token'))
Token.plugin(rand)

Token.methods.isOwner = function(user) {
    return this.userId === user.id
}

Token.methods.loadPermissions = function() {
    const sdk = require('./../raptor').client()
    return sdk.Admin().Token().Permission().get(this.id)
}

Token.methods.isExpired = function() {
    if(this.expires === null || this.expires === 0) {
        return false
    }
    return Date.now() > this.expires
}

Token.methods.isValid = function() {
    return this.enabled && !this.isExpired()
}

Token.methods.merge = function(t) {
    const token = this
    return Promise.resolve()
        .then(() => {

            if (t.name) {
                token.name = t.name
            }

            if (t.secret && t.secret !== token.secret) {
                token.secret = t.secret
            }

            if (t.expires !== undefined) {
                if(t.expires === null || t.expires === 0) {
                    token.expires = 0
                    token.willExpire = false
                } else {
                    token.willExpire = true
                    token.expires = checkDate(t.expires)
                }
            } else {
                token.willExpire = false
            }

            if (t.enabled !== undefined && t.enabled !== null) {
                token.enabled = t.enabled
            }

            return Promise.resolve()
        })
        .then(() => Promise.resolve(token))
}

Token.pre('save', function(next) {
    if(!this.id) {
        this.id = uuidv4()
    }
    if(this.expires === 0 || this.expires === null) {
        this.willExpire = false
    } else {
        this.willExpire = true
    }
    if(this.type) {
        this.type = this.type.toUpperCase()
    }
    next()
})

module.exports = mongoose.model('Token', Token)
