
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const DevStream = require('./stream')
// const Device = require('./device')
const logger = require('../../helper/logger')
const errors = require('../../helper/errors')

var Channel = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    unit: {
        type: String
    },
    // device: {
    //     type: Device.Schema
    // },
    // stream: {
    //     type: DevStream.Schema
    // }
    deviceId: {
        type: String
    },
    streamId: {
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

// Channel.methods.setDevice = function(devId) {
//     Device.findOne({id: devId})
//         .then(dev => {
//             if(!dev) throw new errors.NotFound()
//             // this.device = dev 
//             return Promise.resolve(dev)
//         })
// }

// Channel.methods.setStream = function(streamId) {
//     DevStream.findOne({id: streamId})
//         .then(st => {
//             if(!st) throw new errors.NotFound()
//             // this.device = dev 
//             return Promise.resolve(st)
//         })
// }

// Channel.methods.getStream = function() {
//     DevStream.findOne({id: this.streamId})
//         .then(st => {
//             if(!st) throw new errors.NotFound()
//             // this.device = dev 
//             return Promise.resolve(st)
//         })
// }

let AvailableTypes = ['number','string','boolean','geopoint','object','array']

Channel.pre('save', function(next) {
    if (AvailableTypes.indexOf(this.type) == -1) {
        return "Channel type not supported: " + this.type
    }
    next()
})

module.exports = mongoose.model('Channel', Channel)
