const express = require('express');
const app = express();

var registerFlow = require('./register');
var loginFlow = require('./login');

app.get('/', function(req, res) {
    res.send('hello world');
});

app.get('/register', registerFlow);
app.get('/login', loginFlow);

app.listen(3000, function() {
    console.log('test');
});