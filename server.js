/* --- setting up an express server --- */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('./public/authenticate')
app.use(express.static('public'));
app.listen(8080);
/* --- express server setup --- */

app.use(bodyParser());
app.use(cookieParser());
app.use(expressSession({
 	secret: process.env.SESSION_SECRET || 'secret',
 	resave: false,
 	cookie: { 
 		secure: false, maxAge: new Date(Date.now() + 3600000) 
 		},
 	key:'connect.sid' ,
 	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/* --- connect to mongoDB --- */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jewliday');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
/* --- end of connect to mongoDB --- */
console.log('Connected to mongoDB!')
var usersSchema = [];
db.once('open',function(callback){
	usersSchema = mongoose.Schema({firstName: String, lastName: String, email: String, password: String, agree: Boolean},{collection:'users'});
	User = mongoose.model('users',usersSchema);
});

app.post('/signup',function(req,res){
	var user = req.body;
	console.log('Recieved' + user.firstName);
	var newUser = new User(user);
	newUser.save(function(err,newUser){
		if(err) return console.error(err);
		console.log(newUser);
	})
	res.status(201).json('added to DB' + newUser);
});

app.get('/login', function(request,response){
		response.json(
			{
				isAuthenticated: request.isAuthenticated(),
				user: request.user || ''
			}
		);
	});


app.post('/login',passport.authenticate('local'), function(request,response){
		console.log(request.user);
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