/**
 * Created by Aveline on 25/09/15.
 */
var _ = require('underscore');
var userList = (function(){
    var users = [];
    var bots = [];
    var guestIndex = 0;
    createBots(4);
    setIntervals();

    function createBots(num){
        var messages = ["Did you call my name, %s?","What do you want, %s?","Sup %s?"]
        var statuses = ["active","inactive","playing"];
        for(var i = 1; i <= num; i++){
            var bot = {
                name:"Bot" + i,
                status:statuses[i%statuses.length],
                standardMessage:messages[i%messages.length],
                interval:2000
            };
            bots.push(bot);
            users.push(bot);
        }
    }

    function setIntervals(){
        for(var i = 0; i < bots.length; i++){
            var bot = bots[i];
            setTimeout(function(){
                var item = bot;
                console.log(item.name + " should say something");
            },bot.interval);
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
            console.log(result);
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
        console.log(name);
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
        var result = _.reject(users, function(userItem){ return userItem.name == user.name });
        console.log(result);
        users = result;
    }

    function updateUsername(oldName, newName){
        // check if new name exists
        console.log("updateUsername: " + oldName.name + " to " + newName);
        if(userNameExists(newName)){
            console.log("usernameDoesNotExist");
            for(var i = 0; i < users.length; i++){
                var tempUser = users[i];
                console.log(tempUser);
                if(tempUser.name == oldName.name){
                    tempUser.name = newName;
                    break;
                }
            }
        }
        console.dir(users);

    }

    function checkMessageWithBots(data){
        console.log("checking message: " + data.text);
        var bot = null;
        for(var i = 0; i < bots.length; i++){
            console.log(bots[i].name);
            if(bots[i].name.toLowerCase() == data.text.toLowerCase()){
                bot = bots[i];
            }
        }

        console.log("Result of bot check: " + bot);
        return bot;
    }

    return {
        getAll:getAll,
        createUser:createUser,
        removeUser:removeUser,
        claimName:userNameExists,
        updateUsername:updateUsername,
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
            name = data.name;

            socket.broadcast.emit('change:name', {
                oldName: oldName,
                newName: name
            });

            fn(true);
        } else {
            fn(false);
        }
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
