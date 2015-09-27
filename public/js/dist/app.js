(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var socket = io.connect();

var UsersList = React.createClass({
    displayName: 'UsersList',

    render: function render() {
        return React.createElement(
            'div',
            { className: 'users' },
            React.createElement(
                'h3',
                null,
                ' Online Users '
            ),
            React.createElement(
                'ul',
                null,
                this.props.users.map(function (user, i) {
                    return React.createElement(
                        'li',
                        { key: i },
                        React.createElement('i', { className: 'fa fa-gamepad status-{user.status}' }),
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
            { className: 'messages' },
            React.createElement(
                'h2',
                null,
                ' Conversation: '
            ),
            this.props.messages.map(function (message, i) {
                return React.createElement(Message, {
                    key: i,
                    user: message.user,
                    text: message.text
                });
            })
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
            { className: 'message_form' },
            React.createElement(
                'h3',
                null,
                'Write New Message'
            ),
            React.createElement(
                'form',
                { onSubmit: this.handleSubmit },
                React.createElement('input', {
                    onChange: this.changeHandler,
                    value: this.state.text
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
            { className: 'change_name_form' },
            React.createElement(
                'h3',
                null,
                ' Change Name '
            ),
            React.createElement(
                'form',
                { onSubmit: this.handleSubmit },
                React.createElement('input', {
                    onChange: this.onKey,
                    value: this.state.newName
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
        socket.on('init', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
    },

    _initialize: function _initialize(data) {
        var user = data.user;
        var users = data.users;
        this.setState({ users: users, user: user });
    },

    _receiveMessage: function _receiveMessage(message) {
        var messages = this.state.messages;
        messages.push(message);
        this.setState({ messages: messages });
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
            text: name + ' joined'
        });
        this.setState({ users: users, messages: messages });
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
            text: name + ' left'
        });
        this.setState({ users: users, messages: messages });
    },

    _userChangedName: function _userChangedName(data) {
        var oldName = data.oldName;
        var newName = data.newName;
        var users = this.state.users;
        var messages = this.state.messages;
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == oldName) {
                users[i].name = newName;
                break;
            }
        }
        messages.push({
            user: { name: 'STATUS' },
            text: 'Change Name : ' + oldName + ' ==> ' + newName
        });
        this.setState({ users: users, messages: messages });
    },

    handleMessageSubmit: function handleMessageSubmit(message) {
        var messages = this.state.messages;
        messages.push(message);
        this.setState({ messages: messages });
        socket.emit('send:message', message);
    },

    handleChangeName: function handleChangeName(newName) {
        var _this = this;

        var oldName = this.state.user;
        socket.emit('change:name', { name: newName }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            var users = _this.state.users;
            var index = users.indexOf(oldName);
            users.splice(index, 1, newName);
            _this.setState({ users: users, user: newName });
        });
    },

    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(UsersList, {
                users: this.state.users
            }),
            React.createElement(MessageList, {
                messages: this.state.messages
            }),
            React.createElement(MessageForm, {
                onMessageSubmit: this.handleMessageSubmit,
                user: this.state.user
            }),
            React.createElement(ChangeNameForm, {
                onChangeName: this.handleChangeName
            })
        );
    }
});

React.render(React.createElement(ChatApp, null), document.getElementById('app'));

},{}]},{},[1]);
