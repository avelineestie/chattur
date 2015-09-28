'use strict';
var socket = io.connect();

var statuses = [
    "active","inactive","playing"
];

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
        };
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    },

    changeHandler(e) {
        this.setState({ text : e.target.value });
    },

    render() {
        return(
            <div className='message_form row'>
                <div className="col-sm-12">
                    <form onSubmit={this.handleSubmit} className="form">
                        <textarea
                            onChange={this.changeHandler}
                            value={this.state.text}
                          className="form-control"
                            rows="7"></textarea>
                        <button type="submit" className="btn btn-success col-sm-12">Send message</button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChangeNameForm = React.createClass({
    getInitialState() {
        return {newName: this.props.user.name || ''};
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
            <div className='row change_name_form'>
                <div className="col-sm-12">
                    <form onSubmit={this.handleSubmit} className="form">
                        <input
                            onChange={this.onKey}
                            value={this.state.newName}
                            className="form-control"
                            placeholder="Choose a new name"
                            />
                        <button type="submit" className="btn btn-success col-sm-12">Save name <span className="small">(or pres ENTER)</span></button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChangeStatusForm = React.createClass({
    getInitialState() {
        return {status: '',
        statuses: [
            "active","inactive","playing"
        ]};
    },

    storeOption(e) {
        this.setState({ status : e.target.value });
    },

    handleSubmit(e) {
        e.preventDefault();
        var status = this.state.status;
        this.props.onChangeStatus(status);
        this.setState({ status: status });
    },

    render() {
        // something wrong with the props?
        return(
            <div className='row change_status_form'>
                <div className="col-sm-12">
                    <form onSubmit={this.handleSubmit} className="form">
                        <select className="form-control" onChange={this.storeOption} >
                            {
                                statuses.map((status, i) => {
                                    return (
                                        <option value={status}>{status}</option>
                                    );
                                })
                            }
                        </select>
                        <button type="submit" className="btn btn-success col-sm-12">Save</button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChatApp = React.createClass({

    getInitialState() {
        return {users: [],
            user:{
                name:""
            },
            messages:[],
            text: '',
            statuses:[
                "active","inactive","playing"
            ]
        };
    },

    componentDidMount() {
        socket.on('initialize', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
        socket.on('change:status', this._userChangedStatus);
    },

    _initialize(data) {
        var user = data.user;
        var users = data.users;
        console.log(user);
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

    _userChangedStatus(data) {
        console.log("User changed status!");
        console.log(data);
        var oldStatus = user.status;
        var user = data.user;
        var status = data.status;
        var users = this.state.users;
        var messages = this.state.messages;
        for(var i = 0; i < users.length; i++){
            console.log("checking username " + users[i]);
            if(users[i].name == user.name){
                users[i].status = status;
                break;
            }
        }
        messages.push({
            user: {name:'STATUS'},
            text : 'Someone changed their status from ' + oldStatus + ' to '+ status,
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

    handleChangeStatus(status) {
        console.log("User changed status!");
        console.log(status);
    var user = this.state.user;
    socket.emit('change:status', { status : status}, (result) => {
        console.log("User status withing scope");
        console.log(result);
        if(!result) {
            return alert('There was an error changing your status');
        }
        var users = this.state.users;
        for(var i = 0; i < users.length; i++){
            console.log("checking username " + users[i]);
            if(users[i].name == user.name){
                users[i].status = status;
                user.status = status;
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
                        />
                </div>
                <div className="row fixed-bottom">
                    <div className="col-sm-8">
                        <h3>New message</h3>
                    <MessageForm
                        onMessageSubmit={this.handleMessageSubmit}
                        user={this.state.user}
                        />
                    </div>
                    <div className="col-sm-4">
                        <h3>Settings <i class="fa fa-cog"></i></h3>
                        <ChangeNameForm
                        onChangeName={this.handleChangeName}
                        user={this.state.user}
                        />
                    <ChangeStatusForm
                        onChangeStatus={this.handleChangeStatus}
                        />
                    </div>
                </div>
            </div>
        );
    }
});

React.render(<ChatApp/>, document.getElementById('app'));