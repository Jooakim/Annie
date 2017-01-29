var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var annie = require('./annie.js')
var app = express();

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {  
    res.send('Welcome to our bot');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {  
    if (req.query['hub.verify_token'] === 'OttawaMcHacks17') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// Handle user messages
app.post('/webhook', function (req, res) {  
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;

        // Check if a message and text string exist
        if (event.message && event.message.text) {
            switch(event.message.text) {
                case "menu":
                    sendMessage(sender, {text: "--DISPLAY MENU--"});
                    break;
                case "test":
                    sendMessage(sender, {text: "--SENDING TEST MESSAGE--"});
                    sendTestMessage(sender);
                    break;
                case "help":
                    sendMessage(sender, {text: "--SENDING COMMAND LIST--"});
                    sendMessage(sender, {text: "Commands:\n !add, !remove, !status, !ice (In Case of Emergency)"});
                     break;
                case "medsTest":
                    sendMessage(sender, {text: annie.getMedications(0)});
                    break;
                case "!add":
                    addMed(sender);
                    break;
                case "!remove":
                    removeMed(sender);
                    break;
                case "!status":
                    statMed(sender);
                    break;
                case "!ice":
                    Emergency(sender);
                    break;
                default:
                   sendMessage(sender, {text: "Echo: " + event.message.text});
                    break;
            }
            
        }
    }
    res.sendStatus(200);
});
function addMed(recipientId){
    sendMessage(recipientId,{text: "This should ask for med name, frequency, and duration"});
};
function removeMed(recipientId){
    sendMessage(recipientId, {text: "This should list the meds, numbered, and the number chosen should be removed (after asking)"});
};
function statMed(recipientId){
    sendMessage(recipientId, {text: "This should post the stat of all Meds taken in a list, with duration left, frequency, and med name"});
};
function Emergency(recipientId){
    sendMessage(recipientId, {text: "THIS SHOULD CALL SOMEONE IMPORTANT YO"});
};
// Testing
function sendTestMessage(recipientId) {
let messageData = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": [{
                "title": "First card",
                "subtitle": "Element #1 of an hscroll",
                "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                "buttons": [{
                    "type": "web_url",
                    "url": "https://www.messenger.com",
                    "title": "web url"
                }, {
                    "type": "postback",
                    "title": "Postback",
                    "payload": "Payload for first element in a generic bubble",
                }],
            }, {
                "title": "Second card",
                "subtitle": "Element #2 of an hscroll",
                "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                "buttons": [{
                    "type": "postback",
                    "title": "Postback",
                    "payload": "Payload for second element in a generic bubble",
                }],
            }]
        }
    }
}; 

  sendMessage(recipientId, messageData);
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

