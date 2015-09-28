'use strict';
var socket = io.connect();

var UsersList = React.createClass({
    render() {
        // TODO: ICON DOESNT WORK
        return (
            <div className='users col-sm-4'>
                <h3> Online Users </h3>
                <ul>
                    {
                        this.props.users.map((user, i) => {
                            var statusClass = "fa fa-gamepad status-" + user.status;
                            return (
                                <li key={i} className="user">
                                    <i className={statusClass}></i>
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
                <strong>[{this.props.timestamp}] {this.props.user.name}: </strong>
                <span>{this.props.text}</span>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render() {
        return (
            <div className='messages col-sm-8'>
                <div className='messages-content'>
                {
                    this.props.messages.map((message, i) => {
                        return (
                            <Message
                                key={i}
                                user={message.user}
                                timestamp={message.timestamp}
                                text={message.text}
                                />
                        );
                    })
                }
                </div>
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
            <div className='message_form col-sm-6'>
                <h3>Write New Message</h3>
                <form onSubmit={this.handleSubmit} className="form">
                    <input
                        onChange={this.changeHandler}
                        value={this.state.text}
                      className="form-control"
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
            <div className='change_name_form col-sm-6'>
                <h3> Change Name </h3>
                <form onSubmit={this.handleSubmit} className="form">
                    <input
                        onChange={this.onKey}
                        value={this.state.newName}
                        className="form-control"
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
        socket.on('initialize', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
    },

    _initialize(data) {
        var user = data.user;
        var users = data.users;
        this.setState({users, user: user});
        this.moveUI();
    },

    _receiveMessage(message) {
        message.timestamp = this.getTimestamp();
        var messages = this.state.messages;
        messages.push(message);
        this.moveUI();
        console.log(message);
        this.setState({messages});
        this.moveUI();
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
            text : name +' joined',
            timestamp: this.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
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
            text : name +' left',
            timestamp: this.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
    },

    _userChangedName(data) {
        var oldName = data.oldName;
        var newName = data.newName;
        var users = this.state.users;
        var messages = this.state.messages;
        for(var i = 0; i < users.length; i++){
            console.log("checking username " + users[i]);
            if(users[i].name == oldName){
                users[i].name = newName;
                break;
            }
        }
        messages.push({
            user: {name:'STATUS'},
            text : 'Someone changed their name from ' + oldName + ' to '+ newName,
            timestamp: this.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
    },

    handleMessageSubmit(message) {
        message.timestamp = this.getTimestamp();
        console.dir(message);
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages});
        socket.emit('send:message', message);
        this.moveUI();

    },

    handleChangeName(newName) {
        var user = this.state.user;
        socket.emit('change:name', { name : newName}, (result) => {
            if(!result) {
                return alert('There was an error changing your name');
            }
            var users = this.state.users;
            for(var i = 0; i < users.length; i++){
                console.log("checking username " + users[i]);
                if(users[i].name == user.name){
                    users[i].name = newName;
                    user.name = newName;
                    break;
                }
            }
            this.setState({users, user: user});
            this.moveUI();
        });

        this.moveUI();
    },
    moveUI(){
        console.log("move ui");
        $('html, body').animate({
            scrollTop: $('body').height()
        }, 'slow');
    },
    getTimestamp(){
    var now = new Date();
    var day = ('0' + now.getDate()).slice(-2);
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var year = now.getFullYear();
    var hour = ('0' + now.getHours()).slice(-2);
    var min = ('0' + now.getMinutes()).slice(-2);
    var sec = ('0' + now.getSeconds()).slice(-2);

    return day + '/' + month + "/" + year + " " + hour + ":" + min + ":" + sec;
},

    render() {
        return (
            <div className="container">
                <div className="row content">
                    <MessageList
                        messages={this.state.messages}
                        />
                    <UsersList
                        users={this.state.users}
                        className="col-sm-4"
                        />
                </div>
                <div className="row fixed-bottom">
                    <MessageForm
                        onMessageSubmit={this.handleMessageSubmit}
                        user={this.state.user}
                        className="col-sm-6"
                        />
                    <ChangeNameForm
                        onChangeName={this.handleChangeName}
                        className="col-sm-8"
                        />
                </div>
            </div>
        );
    }
});

React.render(<ChatApp/>, document.getElementById('app'));