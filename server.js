/**
 * Created by Aveline on 25/09/15.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socket = require('./routes/socket.js');

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', socket);

http.listen(1337, function() {
    console.log('listening on localhost:1337');
});

module.exports = app;