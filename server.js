/* --- setting up an express server --- */
var flash = require('connect-flash');
var express = require('express'),
	http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');

var app = express();
var mongoose = require('./mongo');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('./auth');
var AWS = require('aws-sdk'); 
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

app.post('/signup',function(req,res){
	var user = req.body;
	console.log('Recieved ' + user.firstName);

	mongoose.model('users').findOne({"email": user.email}, function(err,oldUser){
		if( oldUser ){
			console.log('same email')
			return res.json(
				{
					isAuthenticated: req.isAuthenticated(),
					message: 'User with this email already signed up'
				}
			);
		} else {
			var User = mongoose.model('users');
			var newUser = new User(user);
			newUser.save(function(err,newUser){
				if(err) return console.error(err);

				var Inbox = mongoose.model('inboxes');
				var newInbox = new Inbox({ownerId: newUser._id});
				newInbox.save(function(err,newInbox){
					if(err) return console.error(err);
					console.log(newInbox);
				})

				console.log(newUser);
			});


			res.status(201).json('added to DB ' + newUser);
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

app.put('/listHome/:id', function(req,res){
	var id = req.params.id;
	var house = req.body;

	var User = mongoose.model('users');
	User.update({_id: id},{$set: {house: house}}, function(){
		User.findById(id, function(err,user){
				if(err) return console.error(err);
				console.log(user);
			});
	})
	//make here ajax request from google and put in mongo the lat & lon
	res.send('Home saved!');
})

function uploadFile(remoteFilename, file, id) {
  var s3bucket = new AWS.S3({ params: {Bucket: 'jewliday'} });
  var fileBuffer = file;
  var date = new Date;
  var type = remoteFilename.split('.')[0];
  var file_ext = remoteFilename.split('.')[1];
  var newFileName = type + Date.parse(date) + '.' + file_ext;
  s3bucket.putObject({
    ACL: 'public-read',
    Bucket: 'jewliday',
    Key:  id + '/' + newFileName,
    Body: fileBuffer,
    ContentType: 'image/jpg'
  }, function(error, response) {
  	console.log(error);
    var User = mongoose.model('users');
    	User.findById(id, function(err,user){
				if(err) return console.error(err);
				user.set(
					'photos.' + type,
					'https://s3-us-west-2.amazonaws.com/jewliday/' + id + '/' + newFileName
					);
				user.save(function(err,user){
					if(err) return console.error(err);
					console.log(user.photos);
				})
				
			});
  });
}

app.post('/upload/:type', function(req, res) {
	var type = req.params.type;
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        console.log(files)
        var id = req.user._id;
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);
 			
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                    	uploadFile( type  +'.' + file_ext,data,id);
                        res.status(200);
                        res.send('uploaded');
                    }
                });
            });
        });
    });
});

app.get('/search/:place',function(req,res){
	var place = req.params.place;
	var User = mongoose.model('users');
	var query = User.find({'house.city': {$regex: new RegExp(place.toLowerCase(), 'i')}}).select('house photos');

	query.exec(function(err,houses){
			if(err) return console.error(err);
			res.json(houses);
	})
})

app.post('/inbox/:id',function(req,res){ //condtion if no conversation exist createnew one
	var Inbox = mongoose.model('inboxes');
	var User = mongoose.model('users');
	var id = req.params.id;
	var message = req.body;
	Inbox.findOne({"ownerId" : id},function(err,inbox){ //send the message
		console.log(inbox)
		var conversation = inbox.conversations.filter(function (conv) {
	   		 return conv.uid == message.uid;
	 	 }).pop();
		if(conversation == undefined){
			console.log('1');
			var last = inbox.conversations.push({
				uid: message.uid,
				uName: message.sender,
				lastMessage: Date.now()
			});
			inbox.conversations[last - 1].messages.push({
				content: message.content,
				iSent: false
				});
		}else {
			console.log('2');
			conversation.lastMessage = Date.now();
			conversation.messages.push({
				content: message.content,
				iSent: false
				});
		}
		inbox.save(function (err) {
		  if (err) return console.error(err)
		  // res.json(message);
		});
		
	});
	User.findOne({ _id: id},function(error,user){
		Inbox.findOne({"ownerId" : message.uid},function(err,inbox){
			var conversation = inbox.conversations.filter(function (conv) {
		   		 return conv.uid == id;
		 	 }).pop();
			if(!conversation || conversation == undefined){
				var last = inbox.conversations.length;
				inbox.conversations.push({
					uid: id,
					uName: user.firstName + ' ' + user.lastName,
					lastMessage: Date.now()
				});
				inbox.conversations[last].messages.push({
					content: message.content,
					read: true
					});
			}else {
				conversation.lastMessage = Date.now();
				conversation.messages.push({
					content: message.content,
					read: true
				});
			}
			inbox.save(function (err) {
			  if (err) return console.error(err)
			  res.json(message);
			});
		})
	})
})

app.get('/inbox/:id', function(req,res){
	var Inbox = mongoose.model('inboxes');
	var id = req.params.id;
	console.log('ownerId ' + id);
	Inbox.find({"ownerId" : id},function(err,inbox){
		console.error(err);
		console.log(inbox);

		res.json(inbox);
	});
})

app.put('/inbox/:id', function(req,res){
	var Inbox = mongoose.model('inboxes');
	var id = req.params.id;
	var uid = req.body
	console.log('ownerId ' + id);
	Inbox.findOne({"ownerId" : id},function(err,inbox){
		var conversation = inbox.conversations.filter(function (conv) {
	   		 return conv.uid == uid.uid;
	 	 }).pop();
		var counter = 0;
		for (var i = 0; i < conversation.messages.length; i++) {
			if(conversation.messages[i].read == false){
				conversation.messages[i].read = true;
				counter += 1;
				console.log('found not read')
			}
		};
		inbox.save(function (err) {
			  if (err) return console.error(err)
			});
			
		console.log('read:' + counter);

		res.json({read: counter});
	});
})