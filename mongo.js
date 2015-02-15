/* --- connect to mongoDB --- */
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
mongoose.connect('mongodb://localhost/jewliday');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
/* --- end of connect to mongoDB --- */
console.log('Connected to mongoDB!')

var usersSchema = [];
var User = {};

var inboxSchema = [];
var Inbox = {};

// var ObjectId = mongoose.Types.ObjectId();

db.once('open',function(callback){
	usersSchema = mongoose.Schema({
		firstName: String,
		lastName: String,
		email: String,
		password: String,
		agree: Boolean },
		{collection:'users'}
	);
	usersSchema.plugin(timestamps);
	inboxSchema = mongoose.Schema({
		// ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		ownerId: String,
		messages: [{
			uid:  {type: mongoose.Schema.Types.ObjectId},
			sender: String,
			subject: String,
			content: String ,
			sent: {type: Date, default: Date.now}
		}]},
		{collection:'inboxes'}
	);

	User = mongoose.model('users',usersSchema);

	Inbox = mongoose.model('inboxes',inboxSchema);
});

module.exports = mongoose;