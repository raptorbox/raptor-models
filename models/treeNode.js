
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DevStream = require('./stream')
const Action = require('./action')
const uuidv4 = require('uuid/v4')
const logger = require('../../helper/logger')
const errors = require('../../helper/errors')

var DeviceSetting = {
    eventsEnabled: true,
    storeData: true
}

var TreeNode = new Schema({
    id: {
        type: String,
        unique: true,
        default: uuidv4
    },
    name: {
        type: String,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    parentId: {
        type: String
    },
    domain: {
        type: String
    },
    order: {
        type: Number
    },
    properties: {
        type: Map,
        of: Schema.Types.Mixed,
        default: new Map()
    },
    children: {
        type: [Schema.Types.Mixed]
    },
    parent: {
        type: Schema.Types.Mixed,
        default: null
    }
}, {
  collection: 'treeNode'
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id
            delete ret.__v
        }
    }
})

TreeNode.plugin(require('./plugin/pager'))

var EntityType = ['app', 'device', 'stream', 'action', 'data', 'tree', 'profile', 
'user', 'permission', 'group', 'token']

TreeNode.pre('init', function(next) {
    if(EntityType.indexOf(this.type) > -1) {
        throw new errors.NotFound()
    }
    next()
})

TreeNode.methods.create = function(deviceId, userId) {
    let node = new TreeNode
    node.id = deviceId
    node.parentId = null
    node.userId = userId
    node.type = 'device'
    node.order = 0
}

TreeNode.methods.create = function(name) {
    let node = new TreeNode
    node.name = name
    node.type = 'tree'
}

TreeNode.methods.getDomain = function() {
    return this.domain
}

TreeNode.methods.merge = function(t) {

    const node = this

    return Promise.resolve()
        .then(() => {

            if (t.name) {
                node.name = t.name
            }

            if (t.userId) {
                node.userId = t.userId
            }

            if (t.id) {
                node.id = t.id
            }

            if (t.domain) {
                node.domain = t.domain
            }

            if (t.order) {
                node.order = t.order
            }

            if (t.parentId) {
                node.parentId = t.parentId
            }

            if (t.type) {
                node.type = t.type
            }

            if (t.children) {
                t.children.forEach(child => {
                    node.children.push(child)
                });
            }

            if (t.parent) {
                node.parent = t.parent
            }
            // return node
            return Promise.resolve()
        })
        .then(() => Promise.resolve(node))
}

TreeNode.methods.getParent = function(parentNode) {
    if(parentNode == null) {
        this.parentId = null
        this.parent = null
    } else {
        this.parentId = parentNode.id
        this.parent = parentNode
    }
    return this
}

TreeNode.methods.isDevice = function() {
    if (this.type == 'device') {
        return true
    }
    return false
}

TreeNode.methods.isUser = function() {
    if (this.type == 'user') {
        return true
    }
    return false
}

TreeNode.methods.isGroup = function() {
    if (this.type == 'group') {
        return true
    }
    return false
}

TreeNode.methods.path = function() {
    let p = ''
    let node = this.parent
    if (node != null) {
        while(node != null) {
            let pid = node.id
            p = p + pid + '/'
            node = node.parent
        }
    }
    return p
}

TreeNode.methods.getChildren = function(node) {
    if (node.userId != null) {
        let nodeId = node.id
        let andQuery = []
        andQuery.push({ 'userId': node.userId})
        if (nodeId != null) {
            andQuery.push({ 'id': nodeId })
        } else {
            andQuery.push({ 'id': null })
        }
        return TreeNode.find({ '$and': andQuery })
            .then(nodes => {
                return nodes
            })
    } else {
        throw new errors.NotFound('UserId is missing')
    }
}

TreeNode.pre('save', function(next) {
    if(EntityType.indexOf(this.type) > -1) {
        throw new errors.NotFound('Tree of type ', this.type, ' cannot be made')
    }
    next()
})

module.exports = mongoose.model('TreeNode', TreeNode, 'treeNode')
