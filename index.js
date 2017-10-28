const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var registerFlow = require('./register');
var loginFlow = require('./login');
var activateFlow = require('./activate');

app.post('/register', registerFlow);

app.get('/activate', activateFlow);
app.get('/login/:email/:pwd', loginFlow);

app.listen(3000, function() {
    console.log('Server started.');
});