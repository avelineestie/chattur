'use strict';
var socket = io.connect();

var UsersList = React.createClass({
    render() {
        // TODO: ICON DOESNT WORK
        return (
            <div className='users'>
                <h3> Online Users </h3>
                <ul>
                    {
                        this.props.users.map((user, i) => {
                            return (
                                <li key={i}>
                                    <i className="fa fa-gamepad status-{user.status}"></i>
                                    {user.name} ({user.status})
                                </li>
                            );
                        })
                    }
                </ul>

            </div>
        );
    }
});

var Message = React.createClass({
    render() {
        return (
            <div className="message">
                <strong>{this.props.user.name}: </strong>
                <span>{this.props.text}</span>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render() {
        return (
            <div className='messages'>
                <h2> Conversation: </h2>
                {
                    this.props.messages.map((message, i) => {
                        return (
                            <Message
                                key={i}
                                user={message.user}
                                text={message.text}
                                />
                        );
                    })
                }
            </div>
        );
    }
});

var MessageForm = React.createClass({

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
            <div className='message_form'>
                <h3>Write New Message</h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.changeHandler}
                        value={this.state.text}
                        />
                </form>
            </div>
        );
    }
});

var ChangeNameForm = React.createClass({
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
            <div className='change_name_form'>
                <h3> Change Name </h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.onKey}
                        value={this.state.newName}
                        />
                </form>
            </div>
        );
    }
});

var ChatApp = React.createClass({

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
        var user = data.user;
        var users = data.users;
        this.setState({users, user: user});
    },

    _receiveMessage(message) {
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages});
    },

    _userJoined(data) {
        console.log("JOINED!");
        console.log(data);
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        users.push(data.user);
        messages.push({
            user: {name:'STATUS'},
            text : name +' joined'
        });
        this.setState({users, messages});
    },

    _userLeft(data) {
        console.log("LEFT!");
        console.log(data);
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        var index;
        for(var i = 0; i < users.length; i++){
            if(users[i].name == name){
                index = i;
                break;
            }
        }
        users.splice(index, 1);
        messages.push({
            user: {name:'STATUS'},
            text : name +' left'
        });
        this.setState({users, messages});
    },

    _userChangedName(data) {
        var oldName = data.oldName;
        var newName = data.newName;
        var users = this.state.users;
        var messages = this.state.messages;
        for(var i = 0; i < users.length; i++){
            if(users[i].name == oldName){
                users[i].name = newName;
                break;
            }
        }
        messages.push({
            user: {name:'STATUS'},
            text : 'Change Name : ' + oldName + ' ==> '+ newName
        });
        this.setState({users, messages});
    },

    handleMessageSubmit(message) {
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages});
        socket.emit('send:message', message);
    },


    // TODO: FIX THIS
    handleChangeName(newName) {
        var oldName = this.state.user;
        socket.emit('change:name', { name : newName}, (result) => {
            if(!result) {
                return alert('There was an error changing your name');
            }
            var users = this.state.users;
            var index = users.indexOf(oldName);
            users.splice(index, 1, newName);
            this.setState({users, user: newName});
        });
    },

    render() {
        return (
            <div className="row">
                <UsersList
                    users={this.state.users}
                    />
                <MessageList
                    messages={this.state.messages}
                    />
                <MessageForm
                    onMessageSubmit={this.handleMessageSubmit}
                    user={this.state.user}
                    />
                <ChangeNameForm
                    onChangeName={this.handleChangeName}
                    />
            </div>
        );
    }
});

React.render(<ChatApp/>, document.getElementById('app'));