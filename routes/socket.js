/**
 * Created by Aveline on 25/09/15.
 */
var _ = require('underscore');
var userList = (function(){
    var users = [];
    var bots = [];
    var guestIndex = 0;
    createBots(4);

    function createBots(num){
        var messages = ["Did you call my name, %s?","What do you want, %s?","Sup %s?"]
        var statuses = ["active","inactive","playing"];
        for(var i = 1; i <= num; i++){
            var bot = {
                name:"Bot" + i,
                status:statuses[i%statuses.length],
                standardMessage:messages[i%messages.length]
            };
            bots.push(bot);
            users.push(bot);
        }
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
            if(bots[i].name.toLowerCase() == data.text.toLowerCase()){
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
        checkMessageWithBots:checkMessageWithBots
    };
})();

module.exports = function (socket) {
    var user = userList.createUser();

    // send the new user their name and a list of users
    socket.emit('initialize', {
        user: user,
        users: userList.getAll()
    });

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
            var message = bot.standardMessage.replace("%s",user.name);
            socket.emit('send:message', {
                user: bot,
                text: message,
                timestamp: getTimestamp()
            });
            socket.broadcast.emit('send:message', {
                user: bot,
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
};
