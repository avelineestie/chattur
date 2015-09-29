var Bot = (function () {
    var _randomTime = 0,
        _randomStatusTime = 0,
        _name = '',
        _status = '',
        _messages = ['Did you call my name, %s?','How are you, %s?','Sup %s?','Yo %s!'],
        _statuses = ['active', 'inactive', 'playing'],
        _autoMessages = [],
        _messageQueue = [],
        _statusQueue = [],
        _init = function () {
            _createRandomTime();
            _createRandomStatusTime();
            _setTimeout();
        },
        _createRandomTime = function(){
            _randomTime = Math.max(parseInt(Math.floor(Math.random() * 40000) + 5000), 20000);
        },
        _createRandomStatusTime = function(){
            _randomStatusTime = Math.max(parseInt(Math.floor(Math.random() * 60000) + 5000), 20000);
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
                    console.log('Added message for ' + message.user.name);
                    _createRandomTime();
                }, _randomTime
            );
            setInterval(
                function(){
                    var isSame = true;
                    var statusText = _getObject().status;
                    do{
                        var tempStatus = _statuses[Math.floor(Math.random() * _statuses.length)];
                        if (tempStatus != statusText) {
                            isSame = false;
                            statusText = tempStatus;
                        }
                    }while(isSame);
                    var status = {
                        user: _getObject(),
                        status: _statuses[Math.floor(Math.random() * _statuses.length)]
                    };
                    _statusQueue.push(status);
                    console.log('Added status for ' + status.user.name);
                    _createRandomStatusTime();
                }, _randomStatusTime
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

            return day + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
        },
        _getMessageQueue = function(){
            return _messageQueue;
        },
        _clearMessageQueue = function(){
            _messageQueue = [];
        },
        _getStatusQueue = function(){
            return _statusQueue;
        },
        _clearStatusQueue = function(){
            _statusQueue = [];
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
        getAutoMessages:_getAutoMessages,
        clearMessageQueue:_clearMessageQueue,
        getMessageQueue:_getMessageQueue,
        clearStatusQueue: _clearStatusQueue,
        getStatusQueue: _getStatusQueue
    }
});
module.exports = Bot;