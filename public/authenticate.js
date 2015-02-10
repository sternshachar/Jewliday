var passport = require('passport');
var passportLocal = require('passport-local').Strategy;


passport.use(new passportLocal(function(email,password,done){
	User.findOne({"email": email },function(err,user){
		console.log(user);
		if(err) return console.error(err);
		if(!(user == undefined) && user.password == password){
			console.log('found');
			done(null,{id: user._id ,name: username});
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
	console.log('deserial works');
	User.findOne({"_id": id},function(err,user){
		if(err) return console.error(err);
		done(null, {id: id, name: user.name});
	});
});


module.exports = passport;