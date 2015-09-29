var Bot = (function (options) {
    var _randomTime = 0,
        _name = "",
        _status = "",
        _messages = ["Did you call my name, %s?","How are you, %s?","Sup %s?","Yo %s!"],
        _autoMessages = [],
        _messageQueue = [],
        _statusQueue = [],
        _init = function () {
            console.log("init bot");
            _createRandomTime();
            _setTimeout();
        },
        _createRandomTime = function(){
            _randomTime = Math.max(parseInt(Math.floor(Math.random() * 25000) + 5000),15000);
        },
        _setTimeout = function () {
            setInterval(
                function(){
                    var message = {
                        user: _getObject(),
                        text: _getAutoMessage(),
                        timestamp: _getTimestamp()
                    };
                    _messageQueue.push(message);
                    console.log("Added message for " + message.user.name);
                    _createRandomTime();
                },_randomTime
            );
        },
        _getTimeout = function(){
            return _randomTime;
        },
        _setStatus = function(newStatus){
            _status = newStatus;
        },
        _getStatus = function(){
            return _status;
        },
        _setName = function(newName){
            _name = newName;
        },
        _getName = function(){
            return _name;
        },
        _getObject = function(){
            return {
                name: _name,
                status: _status
            }
        },
        _getMessages = function(){
            return _messages;
        },
        _getAutoMessages = function(){
            return _autoMessages;
        },
        _setAutoMessages = function(autoMessages){
            _autoMessages = autoMessages;
        },
        _getAutoMessage = function(){
            return _autoMessages[Math.floor(Math.random() * _autoMessages.length)];
        },
        _getMessage = function(){
            return _messages[Math.floor(Math.random() * _messages.length)];
        },
        _getTimestamp = function(){
            var now = new Date();
            var day = ('0' + now.getDate()).slice(-2);
            var month = ('0' + (now.getMonth() + 1)).slice(-2);
            var year = now.getFullYear();
            var hour = ('0' + now.getHours()).slice(-2);
            var min = ('0' + now.getMinutes()).slice(-2);
            var sec = ('0' + now.getSeconds()).slice(-2);

            return day + '/' + month + "/" + year + " " + hour + ":" + min + ":" + sec;
        },
        _getMessageQueue = function(){
            return _messageQueue;
        },
        _clearMessageQueue = function(){
            _messageQueue = [];
        }

    _init();

    return {
        getTimeout:_getTimeout,
        setTimeout:_setTimeout,
        getStatus:_getStatus,
        setStatus:_setStatus,
        getName:_getName,
        setName:_setName,
        getObject:_getObject,
        getMessages:_getMessages,
        getMessage:_getMessage,
        getAutoMessage:_getAutoMessage,
        setAutoMessages:_setAutoMessages,
        getAutoMessages:_getAutoMessages,
        clearMessageQueue:_clearMessageQueue,
        getMessageQueue:_getMessageQueue
    }
});
module.exports = Bot;