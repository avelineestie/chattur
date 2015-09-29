var Bot = (function (options) {
    var _randomTime = 0,
        _name = "",
        _status = "",
        _messages = ["Did you call my name, %s?","What do you want, %s?","Sup %s?"],
        _autoMessages = [],
        _init = function () {
            console.log("init bot");
            _setTimeout();
        },
        _setTimeout = function () {
            //Math.random * 15000)
            _randomTime = Math.max(parseInt(Math.floor(Math.random() * 25000) + 5000),15000);
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
        };

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
        getAutoMessages:_getAutoMessages
    }
});

module.exports = Bot;