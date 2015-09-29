var _ = require('underscore');
var Bot = require('./Bot');
var UserList = (function() {
    var users = [];
    var bots = [];
    var messageQueue = [];
    var statusQueue = [];
    var guestIndex = 0;
    createBots();

    function createBots() {
        var statuses = ["active","inactive","playing"];

        // BOT BATMAN
        var botBatman = new Bot();
        botBatman.setName("Batman");
        botBatman.setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        var automessages = [
            'You\'re not the devil. You\'re practice.',
            'Bats are nocturnal.',
            'NANANANANANA, BATMAN!',
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

    function getMessageQueue() {
        // Populate the messageQueue variable
        _.each(bots, function(bot) {
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
        _.each(bots, function(bot) {
            var botmsgq = bot.getStatusQueue();
            _.each(botmsgq, function(msg) {
                statusQueue.push(msg);
            });

            bot.clearStatusQueue();
        });

        var stq = statusQueue;
        // Clear it since it is a queue
        statusQueue = [];
        return stq;
    }

    function getAll() {
        return users;
    }

    function createUser() {
        var name = "";
        var result = false;
        guestIndex = 0;

        do{
            name = "Guest" + guestIndex;
            result = userNameExists(name);
            if (result == false) {
                guestIndex++;
            }
        }while (result == false);

        var user = {
            name:name,
            status:"active"
        };
        users.push(user);

        return user;

    }

    function userNameExists(name) {
        var result = _.find(users, function(user) {
            return user.name.trim().toLowerCase() == name.trim().toLowerCase()
        });

        // true if username does not exist, false if it does
        return result == undefined;
    }

    function removeUser(user){
        users = _.reject(users, function(userItem) {
            return userItem.name == user.name
        });
    }

    function updateUsername(user, newName) {
        // check if new name exists
        if(userNameExists(newName)) {
            _.find(users, function(iUser) {
                if(iUser.name == user.name){
                    iUser.name = newName;
                    return true;
                }

                return false;
            });
        }
    }

    function updateStatus(user, status) {
        // check if new name exists
        _.find(users, function(iUser) {
            if(iUser.name == user.name) {
                iUser.status = status;
                return true;
            }

            return false;
        });
    }

    function checkMessageWithBots(data) {
        var bot = null;
        _.find(bots, function(tempBot) {
            var index = data.text.toLowerCase().indexOf(tempBot.getObject().name.toLowerCase());
            if (index != -1) {
                bot = tempBot;
                return true;
            }

            return false;
        });

        return bot;
    }

    return {
        getAll: getAll,
        createUser: createUser,
        removeUser: removeUser,
        claimName: userNameExists,
        updateUsername: updateUsername,
        updateStatus: updateStatus,
        checkMessageWithBots: checkMessageWithBots,
        getMessageQueue: getMessageQueue,
        getStatusQueue: getStatusQueue
    };
});
module.exports = UserList;