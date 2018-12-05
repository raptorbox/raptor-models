
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Channel = require('./channel')
// const Device = require('./device')
// const raptor = require('./raptor').client()
const logger = require('../helper/logger')
const errors = require('../helper/errors')

var DevStream = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String
    },
    description: {
        type: String
    },
    dynamic: {
        type: Boolean
    },
    // channels: Map,
    channels: {
        type: Map,
        of: Channel.schema,
        default: new Map()
    },
    deviceId: {
        type: String
    },
    userId: {
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

// App.methods.isOwner = function(user) {
//     return this.userId === user.id
// }

// DevStream.methods.setDevice = function(devId) {
//     return raptor.Inventory().read(devId)
//         .then((dev) => {
//             return dev
//         })
//         .catch((e) => Promise.reject(new errors.Unauthorized(e.message)))
// }

// DevStream.methods.getDevice = function(devId) {
//     return raptor.Inventory().read(devId)
//         .then((dev) => {
//             return dev
//         })
//         .catch((e) => Promise.reject(new errors.Unauthorized(e.message)))
// }

DevStream.methods.merge = function(t) {
    const st = this
    return Promise.resolve()
        .then(() => {

            if (t.name) {
                st.name = t.name
            }

            if (t.type) {
                st.type = t.type
            }

            if (t.description) {
                st.description = t.description
            }

            if (t.dynamic) {
                st.dynamic = t.dynamic
            }

            if (t.deviceId) {
                st.deviceId = t.deviceId
            }

            if (t.userId) {
                st.userId = t.userId
            }

            if (t.channels != null) {
                if (t.channels instanceof Map) {
                    t.channels.forEach((value, key, map) => {
                        if (value instanceof Array) {
                            toObject(this, value, key)
                        } else {
                            st.channels.set(key, value)
                        }
                    })
                } else {
                    Object.keys(t.channels).forEach(key => {
                        if (t.channels[key] instanceof Array) {
                            toObject(this, t.channels[key], key)
                        } else {
                            st.channels.set(key, t.channels[key])
                        }
                    })
                }
            }

            return Promise.resolve()
        })
        .then(() => Promise.resolve(st))
}

function toObject(stream, value, key) {
    let i = 0
    value.forEach(val => {
        stream.channels.set(key + '_' + i, val)
        i++
    })
}

DevStream.methods.addChannel = function(name, type) {
    let prevChannel = this.channels.get(name)
    if (prevChannel != null && prevChannel.type == type) {
        return
    }
    let ch = new Channel();
    ch.name = name
    ch.type = type
    ch.unit = null
    this.channels.set(name, ch)
}

DevStream.methods.addChannel = function(name, type, unit) {
    let prevChannel = this.channels.get(name)
    if (prevChannel != null && prevChannel.type == type) {
        return
    }
    let ch = new Channel();
    ch.name = name
    ch.type = type
    ch.unit = unit
    this.channels.set(name, ch)
}

DevStream.methods.getChannels = function() {
    return Channel.find(this).then((chs) => {
        console.log(chs)
        return chs
    })
}

DevStream.pre('save', function(next) {
    if (this.dynamic) {
        this.channels = null
    }
    next()
})

module.exports = mongoose.model('DevStream', DevStream)
