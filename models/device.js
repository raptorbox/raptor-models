
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DevStream = require('./stream')
const Action = require('./action')
const uuidv4 = require('uuid/v4')
const logger = require('../helper/logger')
const errors = require('../helper/errors')

var DeviceSetting = {
    eventsEnabled: true,
    storeData: true
}

var Device = new Schema({
    _id: {
        type: String,
        unique: true,
        default: uuidv4
    },
    id: {
        type: String,
        unique: true,
        default: uuidv4
    },
    name: {
        type: String,
        index: true,
        required: true
    },
    description: {
        type: String
    },
    userId: {
        type: String,
        required: true
    },
    properties: {
        type: Map,
        of: Schema.Types.Mixed,
        default: new Map()
    },
    actions: {
        type: Map,
        of: Action.Schema,
        default: new Map()
    },
    streams: {
        type: Map,
        of: DevStream.Schema,
        default: new Map()
    },
    domain: {
        type: String
    },
    settings: {
        type: Schema.Types.Mixed,
        default: DeviceSetting
    },
    createdAt: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Number,
        required: true
    }
}, {
  collection: 'device'
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

Device.plugin(require('./plugin/pager'))

Device.methods.getOwnerId = function() {
    return this.userId
}

Device.methods.getDomain = function() {
    return this.domain
}

Device.methods.merge = function(dev) {

    const device = this

    return Promise.resolve()
        .then(() => {
            if (dev._id) {
                // device._id = device.id = dev.id
            }

            if (dev.name) {
                device.name = dev.name
            }

            if (dev.userId) {
                device.userId = dev.userId
            }

            if (dev.description) {
                device.description = dev.description
            }

            if (dev.domain) {
                device.domain = dev.domain
            } else {
                device.domain = null
            }

            if (dev.settings) {
                device.settings = dev.settings
            }

            if (dev.properties) {
                device.properties = dev.properties
            }

            if (dev.createdAt) {
                device.createdAt = dev.createdAt
            }

            if (dev.updatedAt) {
                device.updatedAt = dev.updatedAt
            }

            if (dev.streams) {
                // device.streams = dev.streams

                if (dev.streams instanceof Map) {
                    dev.streams.forEach(function(value, key, map) {
                        let st = value
                        // st.deviceId = device.id
                        // let k = Object.keys(st)
                        // if(k == 'channels') {
                        //     st.dynamic = true
                        // }
                        // if(k == 'dynamic') {
                        //     st.dynamic = k
                        // }
                        // st.name = key
                        // st.userId = device.userId
                        device.streams.set(key, st)
                    });
                } else {
                    Object.keys(dev.streams).forEach(key => {
                        let st = dev.streams[key]
                        // st.deviceId = device.id
                        // let k = Object.keys(st)
                        // if(k == 'channels') {
                        //     st.dynamic = true
                        // }
                        // if(k == 'dynamic') {
                        //     st.dynamic = k
                        // }
                        // st.name = key
                        // st.userId = device.userId
                        device.streams.set(key, st)
                    });
                }
            }

            if (dev.actions) {
                if (dev.actions instanceof Map) {
                    dev.actions.forEach((value, key, map) => {
                        device.actions.set(key, value)
                    })
                } else {
                    Object.keys(dev.actions).forEach(key => {
                        device.actions.set(key, dev.actions[key])
                    })
                }
            }
            return Promise.resolve()
        })
        .then(() => Promise.resolve(device))
}

Device.methods.setDefaults = function() {
    this.id = uuidv4()
    this._id = this.id
    this.createdAt = ((new Date()).getTime()/1000)
    this.updatedAt = this.createdAt
    // this.streams = new Map()
    // this.actions = new Map()
}

Device.methods.setUpdateTime = function() {
    this.updatedAt = (new Date()).getTime()
}

Device.methods.addStreams = function(streams) {
    let dev = this
    streams.forEach(function(value, key, map) {
        let prevStream = dev.streams.get(value)
        value.channels.forEach(function(chVal, chKey, map) {
            if(prevStream != null) {
                prevStream.channels.set(chKey, chVal)
            }
        })
        if(prevStream == null) {
            dev.streams.set(key, value)
        } else {
            prevStream.type = value.type
            prevStream.description = value.description
        }
    });
    return dev
}

Device.methods.addStream = function(streamName) {
    let prevStream = this.streams.get(streamName)
    if(prevStream != null) {
        return prevStream
    }
    let st = new DevStream()
    st.name = streamName
    let m = new Map([[streamName, st]])
    this.addStreams(m)
    return st
}

Device.methods.addStream = function(stName, channelName, channelType ) {
    let st = this.addStream(stName)
    st.addChannel(channelName, channelType)
    return st
}

Device.methods.addStream = function(name, channelType ) {
    return this.addStream(name, name, channelType)
}

Device.methods.addActions = function(actions) {
    let dev = this
    actions.forEach(function(value, key, map) {
        dev.actions.set(key, value)
    });
    return dev
}

Device.methods.addAction = function(actionName) {
    let ac = new Action()
    ac.name = actionName
    let m = new Map([[actionName, ac]])
    this.addActions(m)
    return ac
}

Device.methods.getStream = function(streamId) {
    return this.streams.get(streamId)
}

Device.pre('save', function(next) {
    // this.createdAt = (new Date()).getTime()
    if(!this.id) {
        this.id = uuidv4()
    }
    this._id = this.id
    // if (!this.streams().isEmpty()) {
    //     this.streams().entrySet().forEach((item) -> {
    //         item.getValue().validate();
    //     });
    // }

    // if (!this.actions().isEmpty()) {
    //     this.actions().entrySet().forEach((item) -> {
    //         item.getValue().validate();
    //     });
    // }
    next()
})

module.exports = mongoose.model('Device', Device, 'device')
