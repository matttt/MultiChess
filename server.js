var randtoken = require('rand-token');
var express = require('express');
var socketio = require('socket.io');
var GameHandler = require('./lib/gamehandler');
var useragent = require('express-useragent');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mobilePath = path.join(__dirname, 'clients/mobile')
var desktopPath = path.join(__dirname, 'clients/desktop')

var sessions = {};

function newSession(token, sessions) {
    return sessions[token] = {
        timeCreated: new Date(),
        token: token,
        playersConnected: 0
    }
}

//==============================

server.listen(3000);

app.use(useragent.express());

app.use('/games/:token', (req, res, next) => {
    var user = req.useragent;

    if (user.isMobile) {
        console.log('mobile connected')
        express.static(mobilePath)(req, res, next);
    } else {
        express.static(desktopPath)(req, res, next);
    }
})

app.get(['/newgame', '/new'], (req, res) => {
    var token = randtoken.generate(6);
    var session = newSession(token, sessions);

    var gameMessages = io.of('/games/'+token);
    session.handler = new GameHandler(session, gameMessages);

    res.redirect('/games/' + token);
})