/**
 * Created by Aveline on 25/09/15.
 */
var _ = require('underscore');
var userList = (function(){
    var users = [];
    var guestIndex = 0;
    users.push({
        name:"Bot1",
        status:"active"
    });

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
        if(userNameExists(newName)){
            for(var i = 0; i < users.length; i++){
                var tempUser = users[i];
                if(tempUser.name == oldName){
                    tempUser.name = newName;
                    break;
                }
            }
        }

    }

    return {
        getAll:getAll,
        createUser:createUser,
        removeUser:removeUser,
        claimName:userNameExists,
        updateUsername:updateUsername
    };
})();

module.exports = function (socket) {
    var user = userList.createUser();

    // send the new user their name and a list of users
    socket.emit('init', {
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
            text: data.text
        });
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
};
