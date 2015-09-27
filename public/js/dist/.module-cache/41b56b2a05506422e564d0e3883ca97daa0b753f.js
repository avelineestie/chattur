'use strict';
var UsersList = React.createClass({displayName: "UsersList",
    render() {
        return (
            React.createElement("div", {className: "users"}, 
                React.createElement("h3", null, " Online Users "), 
                React.createElement("ul", null, 
                    
                        this.props.users.map((user, i) => {
                            return (
                                React.createElement("li", {key: i}, 
                                    user, " test"
                                )
                            );
                        })
                    
                )

            )
        );
    }
});

var Message = React.createClass({displayName: "Message",
    render() {
        return (
            React.createElement("div", {className: "message"}, 
                React.createElement("strong", null, this.props.user.name, " :"), 
                React.createElement("span", null, this.props.text)
            )
        );
    }
});

var MessageList = React.createClass({displayName: "MessageList",
    render() {
        return (
            React.createElement("div", {className: "messages"}, 
                React.createElement("h2", null, " Conversation: "), 
                
                    this.props.messages.map((message, i) => {
                        return (
                            React.createElement(Message, {
                                key: i, 
                                user: message.user, 
                                text: message.text}
                                )
                        );
                    })
                
            )
        );
    }
});

var MessageForm = React.createClass({displayName: "MessageForm",

    getInitialState() {
        return {text: ''};
    },

    handleSubmit(e) {
        e.preventDefault();
        var message = {
            user : this.props.user,
            text : this.state.text
        }
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    },

    changeHandler(e) {
        this.setState({ text : e.target.value });
    },

    render() {
        return(
            React.createElement("div", {className: "message_form"}, 
                React.createElement("h3", null, "Write New Message"), 
                React.createElement("form", {onSubmit: this.handleSubmit}, 
                    React.createElement("input", {
                        onChange: this.changeHandler, 
                        value: this.state.text}
                        )
                )
            )
        );
    }
});

var ChangeNameForm = React.createClass({displayName: "ChangeNameForm",
    getInitialState() {
        return {newName: ''};
    },

    onKey(e) {
        this.setState({ newName : e.target.value });
    },

    handleSubmit(e) {
        e.preventDefault();
        var newName = this.state.newName;
        this.props.onChangeName(newName);
        this.setState({ newName: '' });
    },

    render() {
        return(
            React.createElement("div", {className: "change_name_form"}, 
                React.createElement("h3", null, " Change Name "), 
                React.createElement("form", {onSubmit: this.handleSubmit}, 
                    React.createElement("input", {
                        onChange: this.onKey, 
                        value: this.state.newName}
                        )
                )
            )
        );
    }
});

var ChatApp = React.createClass({displayName: "ChatApp",

    getInitialState() {
        return {users: [], messages:[], text: ''};
    },

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
    },

    _initialize(data) {
        var {users, name} = data;
        this.setState({users, user: name});
    },

    _receiveMessage(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    },

    _userJoined(data) {
        var {users, messages} = this.state;
        var {name} = data;
        users.push(name);
        messages.push({
            user: 'APPLICATION BOTjes',
            text : name +' Joined'
        });
        this.setState({users, messages});
    },

    _userLeft(data) {
        var {users, messages} = this.state;
        var {name} = data;
        var index = users.indexOf(name);
        users.splice(index, 1);
        messages.push({
            user: 'APPLICATION BOTje',
            text : name +' Left'
        });
        this.setState({users, messages});
    },

    _userChangedName(data) {
        var {oldName, newName} = data;
        var {users, messages} = this.state;
        var index = users.indexOf(oldName);
        users.splice(index, 1, newName);
        messages.push({
            user: 'APPLICATION BOTjesss',
            text : 'Change Name : ' + oldName + ' ==> '+ newName
        });
        this.setState({users, messages});
    },

    handleMessageSubmit(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
        socket.emit('send:message', message);
    },

    handleChangeName(newName) {
        var oldName = this.state.user;
        socket.emit('change:name', { name : newName}, (result) => {
            if(!result) {
                return alert('There was an error changing your name');
            }
            var {users} = this.state;
            var index = users.indexOf(oldName);
            users.splice(index, 1, newName);
            this.setState({users, user: newName});
        });
    },

    render() {
        return (
            React.createElement("div", null, 
                React.createElement(UsersList, {
                    users: this.state.users}
                    ), 
                React.createElement(MessageList, {
                    messages: this.state.messages}
                    ), 
                React.createElement(MessageForm, {
                    onMessageSubmit: this.handleMessageSubmit, 
                    user: this.state.user}
                    ), 
                React.createElement(ChangeNameForm, {
                    onChangeName: this.handleChangeName}
                    )
            )
        );
    }
});

React.render(React.createElement(ChatApp, null), document.getElementById('messages'));