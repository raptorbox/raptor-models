
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Channel = require('./channel')
const DevStream = require('./stream')
const Device = require('./device')
const Location = require('./location')
const uuidv4 = require('uuid/v4')
const logger = require('../helper/logger')
const errors = require('../helper/errors')

var RecordSet = new Schema({
    id: {
        type: String,
        unique: true,
        default: uuidv4
    },
    timestamp: {
        type: Number,
        index: true,
        required: true
    },
    channels: {
        type: Map,
        of: Channel.Schema,
        default: new Map()
    },
    streamId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    location: {
        type: { type: String },
        coordinates: {type: [Number], index: '2dsphere'}
    },
    device: {
        type: Schema.Types.Mixed,
        default: null
    },
    raw: {
        type: String
    },
    // stream: {
    //     type: DevStream.schema
        // type: Schema.Type.Mixed
    // }
}, {
  collection: 'recordSet'
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
            delete ret.stream
        }
    }
})

RecordSet.index({ "location": "2dsphere" })

// RecordSet.virtual('stream').get(function() {
//     return DevStream.find({id: this.streamId})
//         .then((st) => {
//             return Promise.resolve(st)
//         })
// })

// RecordSet.virtual('stream').set(function(stream) {
//     return DevStream.find({id: this.streamId})
//         .then((st) => {
//             return Promise.resolve(st)
//         })
// })

RecordSet.plugin(require('./plugin/pager'))

// RecordSet.methods.getStream = function(stream) {
//     if(this.streamId) {
//         return stream.findOne()
//     } else {
//         return null
//     }
//     this.streamId = stream.id
// }

RecordSet.methods.getDevice = function() {
    if(this.deviceId) {
        return Promise.resolve(Device.findOne({_id: this.deviceId}))
    } else {
        return null
    }
}

RecordSet.methods.setStream = function(stream) {
    this.streamId = stream.id
}

RecordSet.methods.merge = function(t) {
    const record = this
    return Promise.resolve()
        .then(() => {

            if(t.id) {
                record.id = t.id
            }
            if(t.timestamp) {
                record.timestamp = t.timestamp
            }
            if(!t.timestamp && !record.timestamp) {
                record.timestamp = (new Date()).getTime()
            }
            if (t.channels != null) {
                if (t.channels instanceof Map) {
                    t.channels.forEach((value, key, map) => {
                        if (value instanceof Array) {
                            toObject(this, value, key)
                        } else {
                            record.channels.set(key, value)
                        }
                    })
                } else {
                    Object.keys(t.channels).forEach(key => {
                        if (t.channels[key] instanceof Array) {
                            toObject(this, t.channels[key], key)
                        } else {
                            record.channels.set(key, t.channels[key])
                        }
                    })
                }
            }
            if(t.streamId) {
                record.streamId = t.streamId
            }
            if(t.userId) {
                record.userId = t.userId
            }
            if(t.deviceId) {
                record.deviceId = t.deviceId
            }
            if (t.location) {
                record.location = t.location
            }
            if(record.location == null || record.location == {}) {
                record.location == [null, null]
            }
            if(t.stream) {
                record.stream = t.stream
            }
            if(t.raw) {
                record.raw = t.raw
            }

            return Promise.resolve()
        })
        .then(() => Promise.resolve(record))
}

function toObject(stream, value, key) {
    let i = 0
    value.forEach(val => {
        stream.channels.set(key + '_' + i, val)
        i++
    })
}

RecordSet.pre('save', function(next) {
    if(!this.timestamp || this.timestamp == NaN) {
        this.timestamp = (new Date()).getTime()
    }
    if(!this.id) {
        this.id = uuidv4()
    }
    delete this.stream
    if(this.timestamp.toString().length == 10) {
        this.timestamp = this.timestamp * 1000
    } else if (this.timestamp instanceof String) {
        this.timestamp = Date.parse(this.timestamp)
    } else if (this.timestamp instanceof Number) {
        this.timestamp = Date.parse(this.timestamp)
    }
    next()
})

module.exports = mongoose.model('RecordSet', RecordSet, 'recordSet')
