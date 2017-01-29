'use strict'
var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var pg = require('pg');
var annie = require('./annie.js')
var app = express();


//
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
    console.log(events);
    for (i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        let splitMessage = events;
        
        // Check if a message and text string exist
        if (event.message && event.message.text) {
            switch(event.message.text) {
                case "init":
                if(splitMessage > 1){
                    addUser(sender, splitMessage[1]);
                } else {
                    sendMessage(sender, {text: "Initialize name: init <name>"});
                }
                break;
                case 'showMed':
                    showUser(sender);
                    break;
                case "help":
                    sendMessage(sender, {text: "Commands:\n !add, !remove, !status, !ice (In Case of Emergency)"});
                    break;
                case "medsTest":
                    sendMessage(sender, {text: annie.getMedications(0)});
                    break;
                case "!add":
                if(splitMessage.length > 1){
                    addMed(sender, splitMessage[1], splitMessage[2]);
                } else {
                    sendMessage(sender, {text: "Input medicine <add> <medicineName> <dosage>"});
                }
                    break;
                case "!remove":
                    //removeMed(sender);
                    break;
                case "!status":
                    //statMed(sender);
                    break;
                case "!ice":
                    //Emergency(sender);
                    break;
                case "simon":
                    var output = annie.getDummyJson(0);
                    sendMessage(sender, {text: output.name});
                    break;
                case "addMed":
                    addNewMedication(sender, "test hallo olla");
                    break;
                default:
                    sendMessage(sender, {text: "Echo: " + event.message.text});
                    break;
            }
        } else if (event.payload) {
            switch(event.payload) {
                case "PAYLOAD_ADD":
                    showAddMenu(sender);
                    break;
                case "PAYLOAD_REMOVE":
                    showRemoveMenu(sender);
                    break;
            }
        }
    }
    res.sendStatus(200);
});
function addUser(recipientId, name){
    //sendMessage(recipientId,{text: "This should ask for med name, frequency, and duration"});
    pg.defaults.ssl = true;
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        client
            .query('INSERT INTO users (userid, name) VALUES($1, $2)', [recipientId, name])
            .on('row', function(row) {
                console.log(JSON.stringify(row));
            }).on('error', function(err){
               sendMessage(recipientId, {text: "The user is already initialized"}) 
            });
    });
};

function addMed(recipientId, medicineName, dosage){
    //sendMessage(recipientId,{text: "This should ask for med name, frequency, and duration"});
    pg.defaults.ssl = true;
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        client
            .query('INSERT INTO usermeds (userid, name) VALUES($1, $2)', [recipientId, 'Goran'])
            .on('row', function(row) {
                console.log(JSON.stringify(row));
            });
    });
};

function showUser(recipientId){
    pg.defaults.ssl = true;
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        client
            .query('SELECT name FROM users WHERE userid = ' + recipientId + ';')
            .on('row', function(row) {
                sendMessage(recipientId, {text: row.name});
            });
    });
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

// Display the menu in a webview
function showMenu(recipientId) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "buttons": [{
                        "type": "postback",
                        "title": "Remove a prescription.",
                        "payload": "PAYLOAD_REMOVE",
                    }, {
                        "type": "postback",
                        "title": "Add a prescription.",
                        "payload": "PAYLOAD_ADD",
                    }],
                }]
            }
        }
    }

    sendMessage(recipientId, messageData);
};

function showAddMenu(recipientId) {
    sendMessage(recipientId, {text: "SHOW ADD MENU"});
};

function showRemoveMenu(recipientId) {
    sendMessage(recipientId, {text: "SHOW REMOVE MENU"});
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

function addNewMedication(userId, medInfo) {
    var medInfoArr = creatMedJson(medInfo.split(" "));
    pg.defaults.ssl = true;
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');
        console.log(medInfoArr);

        client
            .query('INSERT INTO user_meds (userid, medname, dosage, timeofaction) VALUES($1, $2, $3, $4)', [recipientId, medInfoArr.name, medInfoArr.dosage, medInfoArr.timeOfAction])
            .on('row', function(row) {
                console.log(JSON.stringify(row));
            });
    });
}


function createMedJson(medInfo) {
    return '{name:medInfo[0], dosage:medInfo[1], timeOfAction:medInfo[2]}';
}


/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*---------------------------------------------- Connecting to DB        --------------------------------------------- */
/*----------------------------------------------                         --------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */
/*-------------------------------------------------------------------------------------------------------------------- */

/*pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT userid FROM user_meds;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});*/
