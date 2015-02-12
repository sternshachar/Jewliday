/* --- setting up an express server --- */
var flash = require('connect-flash');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('./auth')
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
app.use(flash());

/* --- connect to mongoDB --- */
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
mongoose.connect('mongodb://localhost/jewliday');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
/* --- end of connect to mongoDB --- */
console.log('Connected to mongoDB!')
var usersSchema = [];
db.once('open',function(callback){
	usersSchema = mongoose.Schema({firstName: String, lastName: String, email: String, password: String, agree: Boolean },{collection:'users'});
	usersSchema.plugin(timestamps);
	User = mongoose.model('users',usersSchema);
});

app.post('/signup',function(req,res){
	var user = req.body;
	console.log('Recieved' + user.firstName);

	User.findOne({"email": user.email}, function(err,oldUser){
		if( oldUser ){
			console.log('same email')
			return res.json(
				{
					isAuthenticated: req.isAuthenticated(),
					message: 'User with this email already signed up'
				}
			);
		} else {

			var newUser = new User(user);
			newUser.save(function(err,newUser){
				if(err) return console.error(err);
				console.log(newUser);
			});
			res.status(201).json('added to DB' + newUser);
		}
	});


});

app.get('/login', function(request,response){

		response.json(
			{
				isAuthenticated: request.isAuthenticated(),
				user: request.user || ''
			}
		);
	});


app.post('/login', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.json(info); }
	    req.logIn(user, function(err) {
	      if (err) { return next(err); }
	      return res.json(
			{
				isAuthenticated: req.isAuthenticated(),
				user: req.user
			}
		);
	    });
	  })(req, res, next);
	})
	.get(function(request,response){
		response.json(
			{
				isAuthenticated: request.isAuthenticated(),
				user: request.user || ''
			}
		);
	});

app.get("/logout" ,function(req,res){
	req.logout();
	res.redirect('/');
});