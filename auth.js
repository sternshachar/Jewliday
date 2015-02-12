var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var mongoose = require('./mongo');


passport.use(new passportLocal(function(username,password,done){
	mongoose.model('users').findOne({"email": username },function(err,user){
		// console.log(user);
		if(err) return console.error(err);
		if(!user) return done(null, false, { message: 'Wrong E-mail' });
		if(!(user == undefined) && user.password == password){
			console.log('found');
			done(null,{id: user._id ,name: username});
		} else{
			console.log('not found');
			return done(null, false, { message: 'Incorrect Password' });
		}
	});

}));

passport.serializeUser(function(user,done){
	console.log('serial works');
	done(null, user.id);
});

passport.deserializeUser(function(id,done){
	console.log('deserialize works');
	mongoose.model('users').findOne({"_id": id},function(err,user){
		if(err) return console.error(err);
		done(err, user);
	});
});


module.exports = passport;