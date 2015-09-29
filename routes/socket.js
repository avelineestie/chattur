/**
 * Created by Aveline on 25/09/15.
 */
var _ = require('underscore');
var Bot = require('../public/js/objects/Bot');

var userList = (function(){
    var users = [];
    var bots = [];
    var messageQueue = [];
    var statusQueue = [];
    var guestIndex = 0;
    createBots(4);

    function createBots(num){

        var statuses = ["active","inactive","playing"];

        // BOT BATMAN
        var botBatman = new Bot();
        botBatman.setName("Batman");
        botBatman.setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        var automessages = [
            'You\'re not the devil. You\'re practice.',
            'Bats are nocturnal.',
            'NANANANANANA, BATMAN!' +
            'Well, today I found out what Batman can\'t do. He can\'t endure this. Today, you get to say "I told you so."'];
        botBatman.setAutoMessages(automessages);
        bots.push(botBatman);

        // BOT CATWOMAN
        var botCatwoman = new Bot();
        botCatwoman.setName("Catwoman");
        botCatwoman.setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        automessages = [
            'I am Catwoman. Hear me roar.',
            'MEEEOWWW!',
            'You poor guys. Always confusing your pistols with your privates.',
            'Seems like every woman you try to save ends up dead... or deeply resentful. Maybe you should retire.'];
        botCatwoman.setAutoMessages(automessages);
        bots.push(botCatwoman);

        // BOT IRON MAN
        var botIronMan = new Bot();
        botIronMan.setName("Iron Man");
        botIronMan.setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        automessages = [
            'The truth is... I AM IRON MAN!',
            'Iron Man. That\'s kind of catchy. It\'s got a nice ring to it. I mean it\'s not technically accurate. The suit\'s a gold titanium alloy, but it\'s kind of provocative, the imagery anyway.',
            'Day 11, Test 37, Configuration 2.0. For lack of a better option, Dummy is still on fire safety.',
            'I shouldn\'t be alive... unless it was for a reason. I\'m not crazy, Pepper. I just finally know what I have to do. And I know in my heart that it\'s right.',
            'Let\'s face it, this is not the worst thing you\'ve caught me doing.'
        ];
        botIronMan.setAutoMessages(automessages);
        bots.push(botIronMan);

        // Add limited object to users array for display only.
        users.push(botBatman.getObject());
        users.push(botCatwoman.getObject());
        users.push(botIronMan.getObject());
    }

    function getMessageQueue(){
        // Populate the messageQueue variable
        _.each(bots,function(bot){
            var botmsgq = bot.getMessageQueue();
            _.each(botmsgq, function(msg){
                messageQueue.push(msg);
            });
            bot.clearMessageQueue();
        });

        var msgq = messageQueue;
        // Clear it since it is a queue
        messageQueue = [];
        return msgq;
    }

    function getStatusQueue(){
        _.each(bots,function(bot){
            var botmsgq = bot.getStatusQueue();
            _.each(botmsgq, function(msg){
                statusQueue.push(msg);
            });

            bot.clearStatusQueue();
        });

        var stq = statusQueue;
        // Clear it since it is a queue
        statusQueue = [];
        return stq;
    }

    function getAll(){
        return users;
    }

    function createUser(){
        var name = "";
        var result = false;
        guestIndex = 0;

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

        // true if username does not exist, false if it does
        return result == undefined;
    }

    function removeUser(user){
        users = _.reject(users, function(userItem){
            return userItem.name == user.name
        });
    }

    function updateUsername(user, newName){
        // check if new name exists
        if(userNameExists(newName)){
            _.each(users,function(iUser){
                if(iUser.name == user.name){
                    iUser.name = newName;
                }
            });
        }
    }

    function updateStatus(user, status){
        // check if new name exists
        _.each(users,function(iUser){
            if(iUser.name == user.name){
                iUser.status = status;
            }
        });
    }

    function checkMessageWithBots(data){
        var bot = null;
        _.each(bots,function(tempBot){
            if(tempBot.getObject().name.toLowerCase() == data.text.toLowerCase()){
                bot = tempBot;
            }
        });

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
        getMessageQueue: getMessageQueue,
        getStatusQueue: getStatusQueue
    };
})();

module.exports = function (socket) {
    var user = userList.createUser();

    // send the new user their name and a list of users
    socket.emit('initialize', {
        user: user,
        users: userList.getAll()
    });

    setInterval(function() {
        var messages = userList.getMessageQueue();
        if(messages.length != 0) {
            for (var i = 0; i < messages.length; i++) {
                socket.emit('send:message', messages[i]);
                socket.broadcast.emit('send:message', messages[i]);
            }
        }

        var statusUpdates = userList.getStatusQueue();
        if (statusUpdates.length != 0){
            for (var j = 0; j < statusUpdates.length; j++) {
                socket.emit('change:status', {
                    user: statusUpdates[j].user,
                    status: statusUpdates[j].status
                });

                socket.broadcast.emit('change:status', {
                    user: statusUpdates[j].user,
                    status: statusUpdates[j].status
                });
            }
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
