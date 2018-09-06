
// module.exports.Action = require('./action')
// module.exports.Channel = require('./channel')
// module.exports.Device = require('./device')
// module.exports.TreeNode = require('./treeNode')
// // module.exports.Location = require('./location')
// module.exports.RecordSet = require('./recordset')
// module.exports.Stream = require('./stream')

const models = {
    App: require('../models/app'),
    Action: require('./action'),
	Channel: require('./channel'),
	Device: require('./device'),
	TreeNode: require('./treeNode'),
	// Location: require('./location'),
	RecordSet: require('./recordset'),
	Stream: require('./stream'),

	User: require('./user'),
	Role: require('./role'),
	Token: require('./token'),
	
	// Acl: require('./acl'),
	// Client: require('./oauth2/client'),
	// RefreshToken: require('./oauth2/refresh_token'),
	// AuthorizationCode: require('./oauth2/authorization_code')
}

module.exports = models
