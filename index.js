var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    console.log(JSON.stringify(req, null, 4));
    console.log("\n");
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            processMessage(event);
        } else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});

function processMessage(event){
    senderId = event.sender.id;
    message = event.message.text;
    sendMessage(senderId, {text: JSON.stringify(event, null, 4)});
    sendMessage(senderId, {text: "The weather is not 15 C"});
}

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function getCase(message){
    // input: string message
    // output: JSON with case and location fields
    //          or throw error if can't figure it out
    response = {
        "case": "",
        "location": ""
    };
    if (message == "weather in Evanston"){
        response.case = "weather now";
        response.location = "Evanston Illinois";
        return response;
    }
    throw "could not figure parse message";
    return -1;
}