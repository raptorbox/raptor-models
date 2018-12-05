
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Code = mongoose.mongo.Code
const FN = mongoose.Types.Function

var PayloadCodec = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    codec_string: String,
    codec: Code
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

// var EntityType = ['app', 'device', 'stream', 'action', 'data', 'tree', 'profile']

PayloadCodec.pre('save', function(next) {
    if(!this.id) {
        this.id = this.name.replace(/\s+/g, '-').toLowerCase()
    }
    if(this.codec_string) {
      this.codec = new Code(this.codec_string)
    }
    next()
})


module.exports.schema = PayloadCodec
