/**
 * Created by Aveline on 25/09/15.
 */
'use strict';
var _ = require('underscore');
var UserList = require('../public/js/objects/UserList');
var Utils = require('../public/js/objects/Utils')();

var userList = new UserList();

var Socket = function (socket) {
    var user = userList.createUser();

    // send the new user their name and a list of users
    socket.emit('initialize', {
        user: user,
        users: userList.getAll()
    });

    setInterval(function() {
        var messages = userList.getMessageQueue();
        _.each(messages, function(message){
            socket.emit('send:message', message);
            socket.broadcast.emit('send:message', message);
        });

        var statusUpdates = userList.getStatusQueue();
        _.each(statusUpdates, function(update){
            var status = {
                user: update.user,
                status: update.status
            };
            socket.emit('change:status', status);

            socket.broadcast.emit('change:status', status);
        });
    },1000);

    // notify other clients that a new user has joined
    socket.broadcast.emit('user:join', {
        user: user
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        socket.broadcast.emit('send:message', {
            user: user,
            text: data.text,
            timestamp: Utils.getTimestamp()
        });
        var bot = userList.checkMessageWithBots(data);

        if(bot != null){
            var message = bot.getMessage().replace("%s",user.name);
            socket.emit('send:message', {
                user: bot.getObject(),
                text: message,
                timestamp: Utils.getTimestamp()
            });
            socket.broadcast.emit('send:message', {
                user: bot.getObject(),
                text: message,
                timestamp: Utils.getTimestamp()
            });
        }
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
        if (userList.userNameExists(data.name)) {
            var oldName = user.name;
            userList.updateUsername(user, data.name);
            //userNames.free(oldName);
            var newName = data.name;

            socket.broadcast.emit('change:name', {
                oldName: oldName,
                newName: newName
            });

            fn(true);
        } else {
            fn(false);
        }
    });

    // validate a user's status change, and broadcast it on success
    socket.on('change:status', function (data, fn) {
        var status = data.status;
        userList.updateStatus(user, data.status);

        socket.broadcast.emit('change:status', {
            user:user,
            status:status
        });

        fn(true);
    });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
        socket.broadcast.emit('user:left', {
            user: user
        });
        userList.removeUser(user);
    });
};

module.exports = Socket;