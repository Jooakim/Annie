var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var annie = require('./annie.js')
var app = express();

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*---------------------------------------------- Facebook webhook        --------------------------------------------- */
/*----------------------------------------------                         --------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */

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
                    sendTestMessage(sender);
                    break;
                case "help":
                    sendMessage(sender, {text: "Commands:\n !add, !remove, !status, !ice (In Case of Emergency)"});
                    break;
                case "medsTest":
                    sendMessage(sender, {text: annie.getMedications(0)});
                    break;
                case "simon":
                    var output = annie.getDummyJson(0);
                    sendMessage(sender, {text: output.name});
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


function showHelpMessage(recipientId)
{
    var msg = "Commands:\n !add, !remove, !status, !ice (In Case of Emergency)";
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json:{
            recipient: {id: recipientId},
            message: msg,
        }
    },
    function(error,response,body){
        if(error){
            console.log('Error sending message: ', error);
        }else if (response.body.error){
            console.log('Error: ', response.body.error);
        }
        }
    });
};

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


function kittenMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {

            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;

};


/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*---------------------------------------------- Connecting to DB        --------------------------------------------- */
/*----------------------------------------------                         --------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */

/*
pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});

*/

