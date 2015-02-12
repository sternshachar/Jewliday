/* --- connect to mongoDB --- */
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
mongoose.connect('mongodb://localhost/jewliday');
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
/* --- end of connect to mongoDB --- */
console.log('Connected to mongoDB!')

module.exports = mongoose;
module.exports = timestamps;