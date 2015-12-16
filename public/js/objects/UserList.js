var _ = require('underscore');
var Bot = require('./Bot');
var User = require('./User');
var UserList = function(){
    var me = this;
    this.users = [];
    this.bots = [];
    this.messageQueue = [];
    this.statusQueue = [];
    this.guestIndex = 0;

    function init() {
        var botSettings = [
            {
                name: 'Batman',
                messages: [
                    'You\'re not the devil. You\'re practice.',
                    'Bats are nocturnal.',
                    'NANANANANANA, BATMAN!',
                    'Well, today I found out what Batman can\'t do. He can\'t endure this. Today, you get to say "I told you so."'
                ],
                image: 'img/batman.png'
            },
            {
                name: 'Catwoman',
                messages: [
                    'I am Catwoman. Hear me roar.',
                    'MEEEOWWW!',
                    'You poor guys. Always confusing your pistols with your privates.',
                    'Seems like every woman you try to save ends up dead... or deeply resentful. Maybe you should retire.'
                ],
                image: 'img/catwoman.png'
            },
            {
                name: 'Iron Man',
                messages: [
                    'The truth is... I AM IRON MAN!',
                    'Iron Man. That\'s kind of catchy. It\'s got a nice ring to it. I mean it\'s not technically accurate. The suit\'s a gold titanium alloy, but it\'s kind of provocative, the imagery anyway.',
                    'Day 11, Test 37, Configuration 2.0. For lack of a better option, Dummy is still on fire safety.',
                    'I shouldn\'t be alive... unless it was for a reason. I\'m not crazy, Pepper. I just finally know what I have to do. And I know in my heart that it\'s right.',
                    'Let\'s face it, this is not the worst thing you\'ve caught me doing.'
                ],
                image: 'img/iron_man.png'
            }
        ];

        _.each(botSettings, function(customBot) {
            var bot = new Bot();
            bot.setName(customBot.name);
            bot.setAutoMessages(customBot.messages);
            bot.setImage(customBot.image);
            me.bots.push(bot);
            me.users.push(bot.getObject());
        });
    }

    init();

};

UserList.prototype.createUser = function() {
    var me = this;
    var name = '';
    var result = false;
    me.guestIndex = 0;

    do{
        name = 'Guest' + me.guestIndex;
        result = this.userNameExists(name);
        if (result == false) {
            me.guestIndex++;
        }
    }while (result == false);


    var user = new User();
    user.name = name;
    this.users.push(user.getObject());

    return user.getObject();

};

UserList.prototype.userNameExists = function(name) {
    var me = this;
    var result = _.find(me.users, function(user) {
        return user.name.trim().toLowerCase() == name.trim().toLowerCase();
    });

    // true if username does not exist, false if it does
    return result == undefined;
};

UserList.prototype.removeUser = function(user){
    var me = this;
    me.users = _.reject(me.users, function(userItem) {
        return userItem.name == user.name
    });
};

UserList.prototype.getMessageQueue = function() {
    var me = this;
    // Populate the messageQueue variable
    _.each(me.bots, function(bot) {
        var botmsgq = bot.getMessageQueue();
        _.each(botmsgq, function(msg){
            me.messageQueue.push(msg);
        });
        bot.clearMessageQueue();
    });

    var msgq = me.messageQueue;
    // Clear it since it is a queue
    me.messageQueue = [];
    return msgq;
};

UserList.prototype.getStatusQueue = function() {
    var me = this;
    _.each(me.bots, function(bot) {
        var botmsgq = bot.getStatusQueue();
        _.each(botmsgq, function(msg) {
            me.statusQueue.push(msg);
        });

        bot.clearStatusQueue();
    });

    var stq = me.statusQueue;
    // Clear it since it is a queue
    me.statusQueue = [];
    return stq;
};

UserList.prototype.getAll = function() {
    return this.users;
};

UserList.prototype.updateUsername = function(user, newName) {
    var me = this;
    // check if new name exists
    if(me.userNameExists(newName)) {
        _.find(me.users, function(iUser) {
            if(iUser.name == user.name){
                iUser.name = newName;
                return true;
            }

            return false;
        });
    }
};

UserList.prototype.updateStatus = function(user, status, game) {
    var me = this;
    // check if new name exists
    _.find(me.users, function(iUser) {
        if(iUser.name == user.name) {
            iUser.status = status;
            iUser.game = game;
            return true;
        }

        return false;
    });
};

UserList.prototype.checkMessageWithBots = function(data) {
    var me = this;
    var bot = null;
    _.find(me.bots, function(tempBot) {
        var index = data.text.toLowerCase().indexOf(tempBot.getObject().name.toLowerCase());
        if (index != -1) {
            bot = tempBot;
            return true;
        }

        return false;
    });

    return bot;
};

module.exports = UserList;