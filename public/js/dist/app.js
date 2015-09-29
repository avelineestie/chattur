(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var socket = io.connect();

var statuses = ["active", "inactive", "playing"];

var UserList = React.createClass({
    displayName: "UserList",

    render: function render() {
        var _this = this;

        return React.createElement(
            "div",
            { className: "users" },
            React.createElement(
                "h3",
                null,
                React.createElement("i", { className: "fa fa-user" }),
                " Fellow chatturs"
            ),
            React.createElement(
                "ul",
                null,
                this.props.users.map(function (user, i) {
                    var statusClass = "fa fa-gamepad status-" + user.status;
                    var userClass = "user";
                    userClass += _this.props.user.name == user.name ? " current" : "";
                    return React.createElement(
                        "li",
                        { key: i, className: userClass },
                        React.createElement("i", { className: statusClass, alt: user.status }),
                        user.name
                    );
                })
            )
        );
    }
});

var Message = React.createClass({
    displayName: "Message",

    render: function render() {
        return React.createElement(
            "div",
            { className: "message" },
            React.createElement(
                "span",
                { className: "message__timestamp" },
                "[",
                this.props.timestamp,
                "] "
            ),
            React.createElement(
                "span",
                { className: "message__username" },
                this.props.user.name,
                ": "
            ),
            React.createElement(
                "span",
                { className: "message__text" },
                this.props.text
            )
        );
    }
});

var MessageList = React.createClass({
    displayName: "MessageList",

    render: function render() {
        return React.createElement(
            "div",
            { className: "messages" },
            React.createElement(
                "div",
                { className: "messages-content" },
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
    displayName: "MessageForm",

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
            "div",
            { className: "messageform row" },
            React.createElement(
                "div",
                { className: "col-sm-12" },
                React.createElement(
                    "form",
                    { onSubmit: this.handleSubmit, className: "form" },
                    React.createElement("textarea", {
                        onChange: this.changeHandler,
                        value: this.state.text,
                        className: "form-control messageform__text",
                        rows: "7" }),
                    React.createElement(
                        "button",
                        { type: "submit",
                            className: "btn btn-success col-sm-12",
                            disabled: this.state.text.length == 0 },
                        "Send message"
                    )
                )
            )
        );
    }
});

var ChangeNameForm = React.createClass({
    displayName: "ChangeNameForm",

    getInitialState: function getInitialState() {
        return { newName: this.props.user.name || '' };
    },

    onKey: function onKey(e) {
        this.setState({ newName: e.target.value });
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        var newName = this.state.newName;
        if (newName.length > 0) {
            this.props.onChangeName(newName);
            this.setState({ newName: '' });
        }
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: "row change_name_form" },
            React.createElement(
                "div",
                { className: "col-sm-12" },
                React.createElement(
                    "form",
                    { onSubmit: this.handleSubmit, className: "form" },
                    React.createElement("input", {
                        onChange: this.onKey,
                        value: this.state.newName,
                        className: "form-control",
                        placeholder: "Choose a new name"

                    }),
                    React.createElement(
                        "button",
                        { type: "submit",
                            className: "btn btn-success col-sm-12",
                            disabled: this.state.newName.length == 0 },
                        "Save name ",
                        React.createElement(
                            "span",
                            { className: "small" },
                            "(ENTER)"
                        )
                    )
                )
            )
        );
    }
});

var ChangeStatusForm = React.createClass({
    displayName: "ChangeStatusForm",

    getInitialState: function getInitialState() {
        return { status: '',
            statuses: ["active", "inactive", "playing"] };
    },

    storeOption: function storeOption(e) {
        this.setState({ status: e.target.value });
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        var status = this.state.status;
        this.props.onChangeStatus(status);
        this.setState({ status: status });
    },

    render: function render() {
        // something wrong with the props?
        return React.createElement(
            "div",
            { className: "row change_status_form" },
            React.createElement(
                "div",
                { className: "col-sm-12" },
                React.createElement(
                    "form",
                    { onSubmit: this.handleSubmit, className: "form" },
                    React.createElement(
                        "select",
                        { className: "form-control", onChange: this.storeOption },
                        statuses.map(function (status, i) {
                            return React.createElement(
                                "option",
                                { key: i, value: status },
                                status
                            );
                        })
                    ),
                    React.createElement(
                        "button",
                        { type: "submit",
                            className: "btn btn-success col-sm-12",
                            disabled: this.state.status == '' },
                        "Update status"
                    )
                )
            )
        );
    }
});

var ChatApp = React.createClass({
    displayName: "ChatApp",

    getInitialState: function getInitialState() {
        return { users: [],
            user: {
                name: ""
            },
            messages: [],
            text: '',
            statuses: ["active", "inactive", "playing"]
        };
    },

    componentDidMount: function componentDidMount() {
        socket.on('initialize', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
        socket.on('change:status', this._userChangedStatus);
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
        this.setState({ messages: messages });
        this.moveUI();
    },

    _userJoined: function _userJoined(data) {
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        users.push(data.user);
        messages.push({
            user: { name: 'CHATTUR' },
            text: name + ' joined the Chattur-madness.',
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    _userLeft: function _userLeft(data) {
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
            user: { name: 'CHATTUR' },
            text: name + ' has left the building. *drops mic*',
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
            if (users[i].name == oldName) {
                users[i].name = newName;
                break;
            }
        }
        messages.push({
            user: { name: 'CHATTUR' },
            text: oldName + ' wants to be called ' + newName + ' from now on.',
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    _userChangedStatus: function _userChangedStatus(data) {
        var changedUser = data.user;
        var status = data.status;
        var users = this.state.users;
        var messages = this.state.messages;
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == changedUser.name) {
                users[i].status = status;
                break;
            }
        }
        messages.push({
            user: { name: 'CHATTUR' },
            text: changedUser.name + " is now " + status,
            timestamp: this.getTimestamp()
        });
        this.setState({ users: users, messages: messages });
        this.moveUI();
    },

    handleMessageSubmit: function handleMessageSubmit(message) {
        message.timestamp = this.getTimestamp();
        var messages = this.state.messages;
        messages.push(message);
        this.setState({ messages: messages });
        socket.emit('send:message', message);
        this.moveUI();
    },

    handleChangeName: function handleChangeName(newName) {
        var _this2 = this;

        var user = this.state.user;
        socket.emit('change:name', { name: newName }, function (result) {
            if (!result) {
                return alert('There was an error changing your name, please try again soon!');
            }
            var users = _this2.state.users;
            for (var i = 0; i < users.length; i++) {
                if (users[i].name == user.name) {
                    users[i].name = newName;
                    user.name = newName;
                    break;
                }
            }
            _this2.setState({ users: users, user: user });
            _this2.moveUI();
        });
    },

    handleChangeStatus: function handleChangeStatus(status) {
        var _this3 = this;

        var user = this.state.user;

        socket.emit('change:status', { status: status }, function (result) {
            if (!result) {
                return alert('There was an error changing your status, please try again soon!');
            }
            var users = _this3.state.users;
            for (var i = 0; i < users.length; i++) {
                if (users[i].name == user.name) {
                    users[i].status = status;
                    user.status = status;
                    break;
                }
            }
            _this3.setState({ users: users, user: user });
            _this3.moveUI();
        });
    },
    moveUI: function moveUI() {
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
            "div",
            { className: "container" },
            React.createElement(
                "div",
                { className: "row content" },
                React.createElement(
                    "div",
                    { className: "col-sm-9 chattur__messagelist" },
                    React.createElement(MessageList, {
                        messages: this.state.messages
                    })
                ),
                React.createElement(
                    "div",
                    { className: "col-sm-3 chattur__userlist" },
                    React.createElement(UserList, {
                        users: this.state.users,
                        user: this.state.user
                    })
                )
            ),
            React.createElement(
                "div",
                { className: "row fixed-bottom" },
                React.createElement(
                    "div",
                    { className: "col-sm-9 chattur__message" },
                    React.createElement(
                        "h3",
                        null,
                        React.createElement("i", { className: "fa fa-envelope" }),
                        " New message"
                    ),
                    React.createElement(MessageForm, {
                        onMessageSubmit: this.handleMessageSubmit,
                        user: this.state.user
                    })
                ),
                React.createElement(
                    "div",
                    { className: "col-sm-3 chattur__settings" },
                    React.createElement(
                        "h3",
                        null,
                        React.createElement("i", { className: "fa fa-cog" }),
                        " Settings"
                    ),
                    React.createElement(ChangeNameForm, {
                        onChangeName: this.handleChangeName,
                        user: this.state.user
                    }),
                    React.createElement(ChangeStatusForm, {
                        onChangeStatus: this.handleChangeStatus
                    })
                )
            )
        );
    }
});

React.render(React.createElement(ChatApp, null), document.getElementById('app'));

$(window).resize(function (e) {
    $('html, body').animate({
        scrollTop: $('body').height()
    }, 'slow');
});

},{}]},{},[1]);
