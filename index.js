const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const rp = require('request-promise');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var registerFlow = require('./register');
var loginFlow = require('./login');
var activateFlow = require('./activate');
var fbLoginFlow = require('./fblogin');

app.post('/register', registerFlow);

app.get('/activate/:email/:code', activateFlow);
app.get('/login/:email/:pwd', loginFlow);
app.get('/fblogin/:token/:id', fbLoginFlow);

app.listen(3000, function() {
    console.log('Server started.');
});