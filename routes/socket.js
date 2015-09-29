/**
 * Created by Aveline on 25/09/15.
 */
var _ = require('underscore');
var Bot = require('./Bot');

var userList = (function(){
    var users = [];
    var bots = [];
    var messageQueue = [];
    var guestIndex = 0;
    createBots(4);

    function createBots(num){
        var automessages = ["NANANANANANA, BATMAN!","I come from the shadows."];
        var statuses = ["active","inactive","playing"];

        var bot1 = new Bot();
        bot1.setName("Batman");
        bot1.setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        bot1.setAutoMessages(automessages);
        bots.push(bot1);
        setInterval(
            function(){
                var message = {
                    user: bot1.getObject(),
                    text: bot1.getAutoMessage(),
                    timestamp: getTimestamp()
                };
                messageQueue.push(message);
                bot1.setTimeout();
            },bot1.getTimeout()
        );

        var bot2 = new Bot();
        bot2.setName("Catwoman");
        bot2.setStatus("inactive");
        automessages = ["NANANANANANA, CATWOMAN!","MEEEOWWW!","You can't handle me without gloves on..."];
        bot2.setAutoMessages(automessages);
        bots.push(bot2);
        setInterval(
            function(){
                var message = {
                    user: bot2.getObject(),
                    text: bot2.getAutoMessage(),
                    timestamp: getTimestamp()
                };
                messageQueue.push(message);
                bot2.setTimeout();
            },bot2.getTimeout()
        );

        users.push(bot1.getObject());
        users.push(bot2.getObject());
    }

    function getMessageQueue(){
        var msgq = messageQueue;
        messageQueue = [];
        return msgq;
    }

    function getAll(){
        return users;
    }

    function createUser(){
        var name = "";
        var result = false;

        do{
            name = "Guest" + guestIndex;
            result = userNameExists(name);
            if(result == false){
                guestIndex++;
            }
        }while(result == false);

        var user = {
            name:name,
            status:"active"
        };
        users.push(user);

        return user;

    }

    function userNameExists(name){
        var result = _.find(users, function(user){ return user.name == name });

        if(result == undefined){
            // does not exist
            return true;
        }else{
            // user exists
            return false;
        }
    }

    function removeUser(user){
        var result = _.reject(users, function(userItem){
            return userItem.name == user.name
        });
        users = result;
    }

    function updateUsername(user, newName){
        // check if new name exists
        if(userNameExists(newName)){
            for(var i = 0; i < users.length; i++){
                if(users[i].name == user.name){
                    users[i].name = newName;
                    break;
                }
            }
        }
    }

    function updateStatus(user, status){
        // check if new name exists
        for(var i = 0; i < users.length; i++){
            if(users[i].name == user.name){
                users[i].status = status;
                break;
            }
        }

    }

    function checkMessageWithBots(data){
        var bot = null;
        for(var i = 0; i < bots.length; i++){
            var tempBot = bots[i].getObject();
            console.log(tempBot);
            if(tempBot.name.toLowerCase() == data.text.toLowerCase()){
                bot = bots[i];
            }
        }

        return bot;
    }

    return {
        getAll:getAll,
        createUser:createUser,
        removeUser:removeUser,
        claimName:userNameExists,
        updateUsername:updateUsername,
        updateStatus:updateStatus,
        checkMessageWithBots:checkMessageWithBots,
        getMessageQueue: getMessageQueue
    };
})();

module.exports = function (socket) {
    var user = userList.createUser();

    // send the new user their name and a list of users
    socket.emit('initialize', {
        user: user,
        users: userList.getAll()
    });

    setInterval(function(){
        var messages = userList.getMessageQueue();
        for(var i = 0; i < messages.length; i++){
            console.log(messages[i].user);
            socket.emit('send:message', messages[i]);
            socket.broadcast.emit('send:message', messages[i]);
        }
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
            timestamp: getTimestamp()
        });
        var bot = userList.checkMessageWithBots(data);

        if(bot != null){
            console.log("Bot is: " + bot.getObject());
            var message = bot.getMessage().replace("%s",user.name);
            socket.emit('send:message', {
                user: bot.getObject(),
                text: message,
                timestamp: getTimestamp()
            });
            socket.broadcast.emit('send:message', {
                user: bot.getObject(),
                text: message,
                timestamp: getTimestamp()
            });
        }
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
        if (userList.claimName(data.name)) {
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
        name = data.name;

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

function getTimestamp(){
    var now = new Date();
    var day = ('0' + now.getDate()).slice(-2);
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var year = now.getFullYear();
    var hour = ('0' + now.getHours()).slice(-2);
    var min = ('0' + now.getMinutes()).slice(-2);
    var sec = ('0' + now.getSeconds()).slice(-2);

    return day + '/' + month + "/" + year + " " + hour + ":" + min + ":" + sec;
}
