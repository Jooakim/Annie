var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var annie = require('annie.js')
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
                default:
                   sendMessage(sender, {text: "Echo: " + event.message.text});
                    break;
            }
            
        }
    }
    res.sendStatus(200);
});

// Testing
function sendTestMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Add Prescriptions",
            buttons: [{
              type: "postback",
              title: "Call Postback 1",
              payload: "Postback 1 Called",
            }, {
              type: "postback",
              title: "Call Postback 2",
              payload: "Postback 2 Called",
            }],
          }]
        }
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
