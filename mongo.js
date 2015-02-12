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
db.once('open',function(callback){
	usersSchema = mongoose.Schema({firstName: String, lastName: String, email: String, password: String, agree: Boolean },{collection:'users'});
	usersSchema.plugin(timestamps);
	User = mongoose.model('users',usersSchema);
});

