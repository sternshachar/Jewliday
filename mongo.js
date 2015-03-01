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
		agree: Boolean ,
		house : {
			listed: {type: Boolean, default: false},
			city : String,
			street : String,
			homeNumber : Number,
			bedrooms : Number,
			beds: Number,
			homeType : String,
			description: String,
			kosher : String,
			synagouge : Number ,
			amenities : {
				TV : Boolean,
				wifi : Boolean,
				AirCondition : Boolean,
				Dryer : Boolean,
				Elevator : Boolean,
				Essentials : Boolean,
				FreeParking : Boolean,
				Heating : Boolean,
				Fireplace : Boolean,
				PetsAllowed : Boolean,
				Pool : Boolean,
				SmokingAllowed : Boolean,
				Washer : Boolean,
				Accessibility : Boolean
				
			}
		},
		photos:{
				profile: String,
				cover: String,
				pic1: String,
				pic2: String,
				pic3: String,
				pic4: String,
				pic5: String,
				pic6: String
			}

	},

		{collection:'users'}
	);
	usersSchema.plugin(timestamps);
	var messageSchema = mongoose.Schema({
			uid:  {type: mongoose.Schema.Types.ObjectId},
			sender: String,
			subject: String,
			content: String ,
			sent: {type: Date, default: Date.now}
		});
	inboxSchema = mongoose.Schema({
		// ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		ownerId: {type: mongoose.Schema.Types.ObjectId}, //maybe change to id object
		messages: [messageSchema]},
		{collection:'inboxes'}
	);

	User = mongoose.model('users',usersSchema);

	Inbox = mongoose.model('inboxes',inboxSchema);
});

module.exports = mongoose;