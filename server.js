/* --- setting up an express server --- */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.listen(8080);
/* --- express server setup --- */

app.post('/signup',function(req,res){
	var user = req.body;
	res.json(user);
});