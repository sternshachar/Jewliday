/* --- setting up an express server --- */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.listen(8080);
/* --- express server setup --- */
app.use(bodyParser());

/* --- connect to mongoDB --- */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jewliday');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
/* --- end of connect to mongoDB --- */
console.log('Connected to mongoDB!')
var usersSchema = [];
db.once('open',function(callback){
	usersSchema = mongoose.Schema({first_name: String, last_name: String, email: String, password: String, agree: Boolean},{collection:'users'});
	User = mongoose.model('users',usersSchema);
});


app.post('/signup',function(req,res){
	var user = req.body;
	var newUser = new User(user);
	newUser.save(function(err,newUser){
		if(err) return console.error(err);
		console.log(newUser);
	})
	res.status(201).json(newUser);
});