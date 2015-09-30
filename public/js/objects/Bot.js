var Utils = require('./Utils')();
var User = require('./User');
var Bot = function () {
    var me = this;
    this.autoMessages = [];
    this.randomTime = 0;
    this.randomStatusTime = 0;
    this.messages = ['Did you call my name, %s?','How are you, %s?','Sup %s?','Yo %s!'];
    this.statuses = ['active', 'inactive', 'playing'];

    this.messageQueue = [];
    this.statusQueue = [];

    function init(){
        setRandomStatus();
        createRandomTime();
        createRandomStatusTime();
        setTimeout();
    }

    function setRandomStatus() {
        me.setStatus(me.statuses[Math.floor(Math.random() * me.statuses.length)]);
    }

    function setTimeout(){
        // Send messages randomly
        setInterval(
            function(){
                var message = {
                    user: me.getObject(),
                    text: me.getAutoMessage(),
                    timestamp: Utils.getTimestamp()
                };
                me.messageQueue.push(message);
                console.log('Added message for ' + message.user.name);
                createRandomTime();
            }, me.randomTime
        );

        // Change statuses randomly
        setInterval(
            function(){
                var isSame = true;
                var statusText = me.getObject().status;

                do{
                    var tempStatus = me.statuses[Math.floor(Math.random() * me.statuses.length)];
                    if (tempStatus != statusText) {
                        isSame = false;
                        statusText = tempStatus;
                    }
                }while(isSame);

                var status = {
                    user: me.getObject(),
                    status: me.statuses[Math.floor(Math.random() * me.statuses.length)]
                };
                me.statusQueue.push(status);
                console.log('Added status for ' + status.user.name);
                createRandomStatusTime();
            }, me.randomStatusTime
        );
    }

    function createRandomTime(){
        me.randomTime = Math.max(parseInt(Math.floor(Math.random() * 40000) + 5000), 20000);
    }

    function createRandomStatusTime(){
        me.randomStatusTime = Math.max(parseInt(Math.floor(Math.random() * 60000) + 5000), 20000);
    }

    init();
};

Bot.prototype = new User();
Bot.prototype.setAutoMessages = function(messages){
    this.autoMessages = messages;
};

Bot.prototype.getTimeout = function(){
    return this.randomTime;
};

Bot.prototype.getMessages = function(){
    return this.messages;
};

Bot.prototype.getMessage = function(){
    return this.messages[Math.floor(Math.random() * this.messages.length)];
};

Bot.prototype.getAutoMessages = function(){
    return this.autoMessages;
};

Bot.prototype.setAutoMessages = function(autoMessages){
    this.autoMessages = autoMessages;
};

Bot.prototype.getAutoMessage = function(){
    return this.autoMessages[Math.floor(Math.random() * this.autoMessages.length)];
};

Bot.prototype.getMessageQueue = function(){
    return this.messageQueue;
};

Bot.prototype.clearMessageQueue = function(){
    this.messageQueue = [];
};

Bot.prototype.getStatusQueue = function(){
    return this.statusQueue;
};

Bot.prototype.clearStatusQueue = function(){
    this.statusQueue = [];
};

module.exports = Bot;