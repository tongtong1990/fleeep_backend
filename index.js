const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const rp = require('request-promise');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var registerFlow = require('./register');
var loginFlow = require('./login');
var fbLoginFlow = require('./fblogin');
var resendFlow = require('./resendActivationCode');
var checkUserStatusFlow = require('./checkUserStatus');
var updateUserProfileFlow = require('./updateUserProfile');

app.post('/checkUserStatus', checkUserStatusFlow);
app.post('/register', registerFlow);
app.post('/login', loginFlow);
app.post('/resend', resendFlow);
app.post('/updateUserProfile', updateUserProfileFlow);
app.post('/fblogin/:token/:id', fbLoginFlow);

app.listen(3000, function() {
    console.log('Server started.');
});