const sendInBlueApiUri = 'https://api.sendinblue.com/v2.0/email';
const apiKey = 'UBTWCOYkNxb9E1Jz';

var createPostOptions = function(postBody) {
    return {
        method: 'POST',
        uri: sendInBlueApiUri,
        headers: {
            'api-key': apiKey
        },
        json: true,
        body: postBody
    };
};

var createActivationEmail = function(toEmail, activationCode) {
    var to = {};
    to[toEmail] = 'to ' + toEmail;
    return {
        to: to,
        from: ['fleeekio@gmail.com', 'fleeek io'],
        subject: 'Your activation code for fleeek io account',
        html: '<p>Dear user, your activation code is: </p><p><h1>'
        + activationCode + '</h1></p>'
    };
};

module.exports.createPostOptions = createPostOptions;
module.exports.createActivationEmail = createActivationEmail;