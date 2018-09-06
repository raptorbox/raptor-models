const bcrypt = require('bcryptjs')
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('../../helper/logger')
const errors = require('../../helper/errors')

const saltFactor = 10

const User = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: require('uuid/v4'),
        index: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: ['user']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    fullName: String,
    enabled: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    ownerId: {
        type: String,
        ref: 'User'
    },
    nodered: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
            delete ret.password
            ret.created = ret.created.getTime()
        }
    }
})

User.plugin(require('../plugin/pager'))

User.pre('save', function(next) {
    var user = this

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next()

    bcrypt.hash(user.password, saltFactor)
        .then((hash) => {
            user.password = hash
            next()
        })
        .catch((e) => {
            next(e)
        })
})

User.methods.isOwner = function(user) {
    return this.id === user.id
}

User.methods.loadRoles = function() {
    const Role = require('./role')
    const roles = Role.find({
        name: { $in: this.roles }
    })
    return roles
}

User.methods.merge = function(u) {

    const user = this
    const model= this.model('User')

    return Promise.resolve()
        .then(() => {

            if (u.password) {
                user.password = u.password
            }

            if (u.roles && u.roles.length > 0) {
                user.roles = u.roles
                    .map((r) => ((typeof r === 'string') ? r : r.name || null))
                    .filter((r) => (r !== null))
            }

            if (u.fullName) {
                user.fullName = u.fullName
            }

            if (u.enabled !== undefined && u.enabled !== null) {
                user.enabled = u.enabled
            }

            if (u.nodered !== undefined && u.nodered !== null) {
                user.nodered = u.nodered
            }

            if(u.ownerId) {
                user.ownerId = u.ownerId
            }

            return Promise.resolve()
        })
        .then(() => {
            if(u.username === user.username) {
                return Promise.resolve()
            }
            return model.findOne({ username: u.username })
                .then((user2) => {
                    if(user2) {
                        return Promise.reject(new errors.BadRequest('Username already taken'))
                    }

                    user.username = u.username
                    return Promise.resolve()
                })
        })
        .then(() => {
            if(u.email === user.email) {
                return Promise.resolve()
            }
            return model.findOne({ email: u.email })
                .then((user2) => {
                    if(user2) {
                        return Promise.reject(new errors.BadRequest('Email already registered'))
                    }
                    user.email = u.email
                    return Promise.resolve()
                })
        })
        .then(() => {
            return Promise.resolve(user)
        })
}

User.methods.isService = function() {
    return this.get('roles').indexOf('service') > -1
}

User.methods.isAdmin = function() {
    return this.isService() || this.get('roles').indexOf('admin') > -1
}

User.statics.validPassword = function(password, hash) {
    return bcrypt.compare(password, hash)
}

User.statics.hashPassword = function(password) {
    return bcrypt.hash(password, saltFactor)
}

module.exports = mongoose.model('User', User)
