(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var socket = io.connect();

var UsersList = React.createClass({
    displayName: 'UsersList',

    render: function render() {
        // TODO: ICON DOESNT WORK
        return React.createElement(
            'div',
            { className: 'users col-sm-4' },
            React.createElement(
                'h3',
                null,
                ' Online Users '
            ),
            React.createElement(
                'ul',
                null,
                this.props.users.map(function (user, i) {
                    var statusClass = "fa fa-gamepad status-" + user.status;
                    return React.createElement(
                        'li',
                        { key: i, className: 'user' },
                        React.createElement('i', { className: statusClass }),
                        user.name,
                        ' (',
                        user.status,
                        ')'
                    );
                })
            )
        );
    }
});

var Message = React.createClass({
    displayName: 'Message',

    render: function render() {
        return React.createElement(
            'div',
            { className: 'message' },
            React.createElement(
                'strong',
                null,
                '[',
                this.props.timestamp,
                '] ',
                this.props.user.name,
                ': '
            ),
            React.createElement(
                'span',
                null,
                this.props.text
            )
        );
    }
});

var MessageList = React.createClass({
    displayName: 'MessageList',

    render: function render() {
        return React.createElement(
            'div',
            { className: 'messages col-sm-8' },
            React.createElement(
                'div',
                { className: 'messages-content' },
                this.props.messages.map(function (message, i) {
                    return React.createElement(Message, {
                        key: i,
                        user: message.user,
                        timestamp: message.timestamp,
                        text: message.text
                    });
                })
            )
        );
    }
});

var MessageForm = React.createClass({
    displayName: 'MessageForm',

    getInitialState: function getInitialState() {
        return { text: '' };
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        var message = {
            user: this.props.user,
            text: this.state.text
        };
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    },

    changeHandler: function changeHandler(e) {
        this.setState({ text: e.target.value });
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'message_form col-sm-6' },
            React.createElement(
                'h3',
                null,
                'Write New Message'
            ),
            React.createElement(
                'form',
                { onSubmit: this.handleSubmit, className: 'form' },
                React.createElement('input', {
                    onChange: this.changeHandler,
                    value: this.state.text,
                    className: 'form-control'
                })
            )
        );
    }
});

var ChangeNameForm = React.createClass({
    displayName: 'ChangeNameForm',

    getInitialState: function getInitialState() {
        return { newName: '' };
    },

    onKey: function onKey(e) {
        this.setState({ newName: e.target.value });
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        var newName = this.state.newName;
        this.props.onChangeName(newName);
        this.setState({ newName: '' });
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'change_name_form col-sm-6' },
            React.createElement(
                'h3',
                null,
                ' Change Name '
            ),
            React.createElement(
                'form',
                { onSubmit: this.handleSubmit, className: 'form' },
                React.createElement('input', {
                    onChange: this.onKey,
                    value: this.state.newName,
                    className: 'form-control'
                })
            )
        );
    }
});

var ChatApp = React.createClass({
    displayName: 'ChatApp',

    getInitialState: function getInitialState() {
        return { users: [], messages: [], text: '' };
    },

    componentDidMount: function componentDidMount() {
        socket.on('initialize', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
    },

    _initialize: function _initialize(data) {
        var user = data.user;
        var users = data.users;
        this.setState({ users: users, user: user });
        this.moveUI();
    },

    _receiveMessage: function _receiveMessage(message) {
        message.timestamp = this.getTimestamp();
        var messages = this.state.messages;
        messages.push(message);
        this.moveUI();
        console.log(message);
        this.setState({ messages: messages });
        this.moveUI();
    },

    _userJoined: function _userJoined(data) {
        console.log("JOINED!");
        console.log(data);
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        users.push(data.user);
        messages.push({
            user: { name: 'STATUS' },
            text: name + ' joined',
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    _userLeft: function _userLeft(data) {
        console.log("LEFT!");
        console.log(data);
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        var index;
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == name) {
                index = i;
                break;
            }
        }
        users.splice(index, 1);
        messages.push({
            user: { name: 'STATUS' },
            text: name + ' left',
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    _userChangedName: function _userChangedName(data) {
        var oldName = data.oldName;
        var newName = data.newName;
        var users = this.state.users;
        var messages = this.state.messages;
        for (var i = 0; i < users.length; i++) {
            console.log("checking username " + users[i]);
            if (users[i].name == oldName) {
                users[i].name = newName;
                break;
            }
        }
        messages.push({
            user: { name: 'STATUS' },
            text: 'Someone changed their name from ' + oldName + ' to ' + newName,
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    handleMessageSubmit: function handleMessageSubmit(message) {
        message.timestamp = this.getTimestamp();
        console.dir(message);
        var messages = this.state.messages;
        messages.push(message);
        this.setState({ messages: messages });
        socket.emit('send:message', message);
        this.moveUI();
    },

    handleChangeName: function handleChangeName(newName) {
        var _this = this;

        var user = this.state.user;
        socket.emit('change:name', { name: newName }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            var users = _this.state.users;
            for (var i = 0; i < users.length; i++) {
                console.log("checking username " + users[i]);
                if (users[i].name == user.name) {
                    users[i].name = newName;
                    user.name = newName;
                    break;
                }
            }
            _this.setState({ users: users, user: user });
            _this.moveUI();
        });

        this.moveUI();
    },
    moveUI: function moveUI() {
        console.log("move ui");
        $('html, body').animate({
            scrollTop: $('body').height()
        }, 'slow');
    },
    getTimestamp: function getTimestamp() {
        var now = new Date();
        var day = ('0' + now.getDate()).slice(-2);
        var month = ('0' + (now.getMonth() + 1)).slice(-2);
        var year = now.getFullYear();
        var hour = ('0' + now.getHours()).slice(-2);
        var min = ('0' + now.getMinutes()).slice(-2);
        var sec = ('0' + now.getSeconds()).slice(-2);

        return day + '/' + month + "/" + year + " " + hour + ":" + min + ":" + sec;
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
                'div',
                { className: 'row content' },
                React.createElement(MessageList, {
                    messages: this.state.messages
                }),
                React.createElement(UsersList, {
                    users: this.state.users,
                    className: 'col-sm-4'
                })
            ),
            React.createElement(
                'div',
                { className: 'row fixed-bottom' },
                React.createElement(MessageForm, {
                    onMessageSubmit: this.handleMessageSubmit,
                    user: this.state.user,
                    className: 'col-sm-6'
                }),
                React.createElement(ChangeNameForm, {
                    onChangeName: this.handleChangeName,
                    className: 'col-sm-8'
                })
            )
        );
    }
});

React.render(React.createElement(ChatApp, null), document.getElementById('app'));

},{}]},{},[1]);
