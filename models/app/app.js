
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AppUser = require('./app_user')
const AppRole = require('./app_role')
const AppDelta = require('./app_delta')
const AppPayloadCodec = require('./app_payload_codec')
const uuidv4 = require('uuid/v4')
const logger = require('../../helper/logger')

var App = new Schema({
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
    domain: {
        type: String,
        index: true,
        required: false,
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true,
    },
    userId: {
        type: String,
        index: true,
        required: true,
    },
    roles: {
        type: [AppRole.schema],
    },
    users: {
        type: [AppUser.schema]
    },
    properties: {
        type: Schema.Types.Mixed,
        default: {}
    },
    delta: {
        type: AppDelta.schema,
        default: {}
    },
    payload_codec: {
      type: AppPayloadCodec.schema
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

App.plugin(require('./plugin/pager'))

App.methods.isOwner = function(user) {
    return this.userId === user.id
}

App.methods.merge = function(t) {
    const app = this
    return Promise.resolve()
        .then(() => {

            if (t.name) {
                app.name = t.name
            }

            if (t.domain) {
                app.domain = t.domain
            }

            if (t.userId) {
                if(t.userId !== app.userId) {
                    app.userId = t.userId
                }
            }

            let isAvailable = function (u) {
                for (var i = 0; i < app.users.length ; i++) {
                    if(app.users[i].id === u.id) {
                        return i;
                    }
                }
                return -1
            }

            // let roleChanged = function (u) {
            //     for (var i = 0; i < app.users.length ; i++) {
            //         if(app.users[i].roles !== u.roles) {
            //             return true;
            //         }
            //     }
            //     return false
            // }

            if (t.users) {
                let temp = app.users
                // let tempRoles = []
                t.users.forEach(u => {
                    let i = isAvailable(u);
                    if (i !== -1) {
                        temp.splice(i, 1)
                    }
                    // if (roleChanged(u)) {
                    //     tempRoles.push(u)
                    // }
                })
                app.delta.deletedUsers = temp
                // app.delta.userOldRoles = tempRoles
                app.users = t.users
            }

            // add owner as admin
            if(app.users.filter((u) => u.id === app.userId).length === 0) {
                app.users.push({
                    id: app.userId,
                    roles: [ 'admin' ]
                })
            }

            if (t.enabled !== undefined && t.enabled !== null) {
                app.enabled = t.enabled
            }

            if (t.roles && t.roles.length > 0) {
                app.roles = t.roles
            }

            // ensure admin role
            if(app.roles.filter((r) => r.name === 'admin').length === 0) {
                app.roles.push({
                    name : 'admin',
                    permissions: ['admin']
                })
            }

            // Properties: to add extra data in application
            if(t.properties) {
                let keys = Object.keys(t.properties)
                for (var i = 0; i < keys.length; i++) {
                    logger.debug(t.properties[keys[i]])
                    app.properties[keys[i]] = t.properties[keys[i]]
                }
            }

            // Payload codec: payload decoding type and function
            if(t.payload_codec) {
                app.payload_codec = t.payload_codec
            }

            return Promise.resolve()
        })
        .then(() => Promise.resolve(app))
}

App.pre('save', function(next) {
    if(!this.id) {
        this.id = uuidv4()
    }
    next()
})

module.exports = mongoose.model('App', App)
