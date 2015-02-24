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

app.get('/inbox/:id', function(req,res){
	var Inbox = mongoose.model('inboxes');
	var id = req.params.id;
	console.log('ownerId ' + id);
	Inbox.find({"ownerId" : id},function(err,messages){
		console.error(err);
		console.log(messages);
		res.json(messages);
	});
})

app.post('/inbox/:id',function(req,res){
	var Inbox = mongoose.model('inboxes');
	var id = req.params.id;
	var message = req.body;
	Inbox.findOne({"ownerId" : id},function(err,inbox){
		console.log(inbox)
		inbox.messages.push(message);
		inbox.save(function (err) {
		  if (err) return handleError(err)
		  res.json(message);
		});
		
	});
})
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
	res.send('Home saved!');
})


app.post('/photo',function(req,res){
	
	console.log(req.file);
	uploadFile('image1', req.body.file)
	
	res.send('Sent image');
})


function uploadFile(remoteFilename, file) {
  var s3bucket = new AWS.S3({ params: {Bucket: 'jewliday'} });
  var fileBuffer = file;
  
  s3bucket.putObject({
    ACL: 'public-read',
    Bucket: 'jewliday',
    Key: remoteFilename,
    Body: fileBuffer,
    ContentType: 'image/jpg'
  }, function(error, response) {
    console.log('uploaded file to [' + remoteFilename + '] as [' + 'jewliday' + ']');
    // console.log(arguments);
  });
}

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var id = files.id;
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);
 			console.log(id);
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                    	uploadFile('image1'+ '.' + file_ext,data)
                        res.status(200);
                        res.json({new_path});
                    }
                });
            });
        });
    });
});
