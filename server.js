/* --- setting up an express server --- */
var express = require('express');
var app = express();
var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
// var passport = require('./public/authenticate')
app.use(express.static('public'));
app.listen(8080);
/* --- express server setup --- */

app.use(bodyParser());
app.use(cookieParser());
app.use(expressSession({
 	secret: process.env.SESSION_SECRET || 'secret',
 	resave: false,
 	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new passportLocal(function(email,password,done){
	User.findOne({"email": email },function(err,user){
		console.log(user);
		if(err) return console.error(err);
		if(!(user == undefined) && user.password == password){
			console.log('found');
			done(null,{id: user._id ,name: email});
		} else{
			console.log('not found');
			done(null,null);
		}
	});

}));

passport.serializeUser(function(user,done){
	console.log('serial works');
	done(null, user.id);
});

passport.deserializeUser(function(id,done){
	console.log(id);
	User.findOne({"_id": id},function(err,user){
		if(err) return console.error(err);
		done(null, {id: id, name: user.email});
	});
});

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
	console.log('Recieved' + user);
	var newUser = new User(user);
	newUser.save(function(err,newUser){
		if(err) return console.error(err);
		console.log(newUser);
	})
	res.status(201).json('added to DB' + newUser);
});


app.post('/login',passport.authenticate('local'), function(request,response){
		//console.log(request.body);
		response.json(
			{
				isAuthenticated: request.isAuthenticated(),
				user: request.user
			}
		);
	})
	.get(function(request,response){
		response.json(
			{
				isAuthenticated: request.isAuthenticated(),
				user: request.user || ''
			}
		);
	});