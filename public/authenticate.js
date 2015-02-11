var passport = require('passport');
var passportLocal = require('passport-local').Strategy;


passport.use(new passportLocal(function(username,password,done){
	User.findOne({"email": username },function(err,user){
		console.log(user);
		if(err) return console.error(err);
		if(!(user == undefined) && user.password == password){
			console.log('found');
			done(null,{id: user._id ,name: user_id});
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
	console.log('deserialize works');
	User.findOne({"_id": id},function(err,user){
		if(err) return console.error(err);
		done(err, {id: id, name: user.email});
	});
});


module.exports = passport;