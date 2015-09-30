'use strict';
var socket = io.connect();
var _ = require('underscore');
var Utils = require('../objects/Utils')();

var UserList = React.createClass({
    componentDidMount() {
        setTimeout( function() {
            setupUserlist();

        }, 250);
    },
    render() {
        return (
            <div className='users'>
                <h3><i className='fa fa-user'></i> Fellow chatturs</h3>
                <ul>
                    {
                        this.props.users.map((user, i) => {
                            var alt = user.name + ' is ' + user.status;
                            var statusClass = 'user--status__' + user.status;
                            var userClass = 'user';
                            userClass += this.props.user.name == user.name ? ' user--current': '';
                            return (
                                <li key={i} className={userClass}>
                                    <img src={user.image} className={statusClass} width='50' alt={alt}/>
                                    <span>{user.name}</span><br/>
                                    <span className='user__status'>{user.status} {user.game}</span>
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
        var messageClass = 'message';
        messageClass += this.props.user.name == 'CHATTUR' ? ' message__system':'';
        return (
            <div className={messageClass}>
                <span className='message__timestamp'>[{this.props.timestamp}] </span>
                <span className='message__username'>{this.props.user.name}: </span>
                <span className='message__text'>{this.props.text}</span>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render() {
        return (
            <div className='messages'>
                <div className='messages__content'>
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

    checkEntry(e) {
        if(e.keyCode == 13 && !e.shiftKey){
            this.handleSubmit(e);
        }
    },

    render() {
        return(
            <div className='messageform row'>
                <div className='col-xs-12'>
                    <form onSubmit={this.handleSubmit} className='form'>
                        <textarea
                            onChange={this.changeHandler}
                            onKeyDown={this.checkEntry}
                            value={this.state.text}
                            className='form-control messageform__text'
                            rows='7'></textarea>
                        <button type='submit'
                                className='btn btn-success col-xs-12'
                                disabled={this.state.text.length == 0}>Send message</button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChangeNameForm = React.createClass({
    getInitialState () {
        return {newName: this.props.user.name || ''};
    },

    onKey(e) {
        if(e.target.value.length > 20){
            console.error('Should show error now!');
        }
        this.setState({ newName : e.target.value });
    },

    handleSubmit(e) {
        e.preventDefault();
        var newName = this.state.newName;
        if(newName.length > 0 && newName.length < 21){
            this.props.onChangeName(newName);
            this.setState({ newName: '' });
        }
    },

    render() {
        return(
            <div className='row nameform'>
                <div className='col-xs-12'>
                    <form onSubmit={this.handleSubmit} className='form'>
                        <input
                            onChange={this.onKey}
                            value={this.state.newName}
                            className='form-control'
                            placeholder='Choose a new name'
                            maxLength='20'
                            />
                        <button type='submit'
                                className='btn btn-success col-xs-12'
                                disabled={this.state.newName.length == 0 || this.state.newName.length > 20}>Save name</button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChangeStatusForm = React.createClass({
    getInitialState() {
        return {status: '', game: ''};
    },

    storeOption(e) {
        this.setState({ status : e.target.value });
    },

    storeGame(e) {
        this.setState({
            game : e.target.value
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        var status = this.state.status;
        var game = this.state.game;
        this.props.onChangeStatus(status, game);
        this.setState({ status: '', game: '' });
    },

    render() {
        var statuses = [
            'active','inactive','playing'
        ];

        var enableInput = this.state.status != 'playing';
        return(
            <div className='row statusform'>
                <div className='col-xs-12'>
                    <form onSubmit={this.handleSubmit} className='form'>
                        <select className='form-control' onChange={this.storeOption} >
                            {
                                statuses.map((status, i) => {
                                    return (
                                        <option key={i} value={status}>{status}</option>
                                    );
                                })
                            }
                        </select>
                        <input type='text'
                               disabled={enableInput}
                               onChange={this.storeGame}
                               value={this.state.game}
                               className='form-control'
                               maxLength='15'/>
                        <button type='submit'
                                className='btn btn-success col-xs-12'
                                disabled={this.state.status == ''}>Update status</button>
                    </form>
                </div>
            </div>
        );
    }
});

var ChatApp = React.createClass({

    getInitialState () {
        return {
            users: [],
            user:{
                name: '',
                game: ''
            },
            messages: [],
            text: '',
            statuses:[
                'active','inactive','playing'
            ]
        };
    },

    componentDidMount () {
        socket.on('initialize', this._initialize);
        socket.on('send:message', this._receiveMessage);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
        socket.on('change:status', this._userChangedStatus);
    },

    _initialize (data) {
        var user = data.user;
        var users = data.users;
        this.setState({users, user: user});
        this.moveUI();
    },

    _receiveMessage (message) {
        message.timestamp = Utils.getTimestamp();
        var messages = this.state.messages;
        messages.push(message);
        this.moveUI();
        this.setState({messages});
        this.moveUI();
    },

    _userJoined (data) {
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        users.push(data.user);
        messages.push({
            user: {name: 'CHATTUR'},
            text : name +' joined the Chattur-madness.',
            timestamp: Utils.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
    },

    _userLeft(data) {
        var users = this.state.users;
        var messages = this.state.messages;
        var name = data.user.name;
        var userLocation;

        _.find(users, function(selectedUser, index){
            if (selectedUser.name == name) {
                userLocation = index;
                return true;
            }

            return false;
        });

        users.splice(userLocation, 1);
        messages.push({
            user: {name: 'CHATTUR'},
            text : name +' has left the building. *drops mic*',
            timestamp: Utils.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
    },

    _userChangedName(data) {
        var oldName = data.oldName;
        var newName = data.newName;
        var users = this.state.users;
        var messages = this.state.messages;
        var user = this.state.user;

        _.find(users, function(selectedUser){
            if (selectedUser.name == oldName) {
                selectedUser.name = newName;
                return true;
            }

            return false;
        });
        if(oldName == user.name){
            messages.push({
                user: {name: 'CHATTUR'},
                text : 'You changed your name to '+ newName,
                timestamp: Utils.getTimestamp()
            });
            user.name = newName;
        }else{
            messages.push({
                user: {name: 'CHATTUR'},
                text : oldName + ' wants to be called '+ newName + ' from now on.',
                timestamp: Utils.getTimestamp()
            });
        }

        this.setState({users, messages, user: user});
        this.moveUI();
    },

    _userChangedStatus(data) {
        var changedUser = data.user;
        var status = data.status;
        var game = data.game;
        var users = this.state.users;
        var messages = this.state.messages;

        _.find(users, function(user){
            if (user.name == changedUser.name) {
                user.status = status;
                user.game = game;
                return true;
            }

            return false;
        });

        messages.push({
            user: {name: 'CHATTUR'},
            text : changedUser.name + ' is now ' + status + ' ' + game,
            timestamp: Utils.getTimestamp()
        });
        this.setState({users, messages});
        this.moveUI();
    },

    handleMessageSubmit(message) {
        message.timestamp = Utils.getTimestamp();
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages});
        socket.emit('send:message', message);
        this.moveUI();

    },

    handleChangeName(newName) {
        var user = this.state.user;
        socket.emit('change:name', { name: newName}, (result) => {
            if (!result) {
                return alert('There was an error changing your name, please try again soon!');
            }
            var users = this.state.users;
            _.find(users, function(selectedUser) {
                if (selectedUser.name == user.name) {
                    selectedUser.name = newName;
                    user.name = newName;
                    return true;
                }

                return false;
            });

            this.setState({users, user: user});
            this.moveUI();
        });
    },

    handleChangeStatus(status, game) {
        var user = this.state.user;

        socket.emit('change:status', { status : status, game: game }, (result) => {
            if (!result) {
                return alert('There was an error changing your status, please try again soon!');
            }
            var users = this.state.users;
            _.find(users, function(selectedUser){
                if (selectedUser.name == user.name) {
                    selectedUser.game = game;
                    selectedUser.status = status;
                    user.status = status;
                    user.game = game;
                    return true;
                }

                return false;
            });
            this.setState({users, user: user});
            this.moveUI();
        });
    },
    moveUI(){
        var position = 0;

        // Select the right element for the right scroll behaviour
        if (window.matchMedia('(max-width:767px)')) {
            position = $('.chattur__messagelist').height();
        } else {
            position = $('body').height();
        }

        $('html, body').animate({
            scrollTop: position
        }, 'slow');
    },

    render() {
        return (
            <div className='container'>
                <div className='row content'>
                    <div className='col-xs-9 chattur__messagelist'>
                        <MessageList
                            messages={this.state.messages}
                        />
                    </div>
                    <div className='col-xs-3 chattur__userlist'>
                        <UserList
                            users={this.state.users}
                            user={this.state.user}
                        />
                    </div>
                </div>
                <div className='row row--fixedbottom'>
                    <div className='col-sm-9 chattur__message'>
                        <h3><i className='fa fa-envelope'></i> New message</h3>
                    <MessageForm
                        onMessageSubmit={this.handleMessageSubmit}
                        user={this.state.user}
                        />
                    </div>
                    <div className='col-sm-3 chattur__settings'>
                        <h3><i className='fa fa-cog'></i> Settings</h3>
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

$(document).ready(function () {
    $(window).resize(function () {
        // Also scroll to bottom in case of resize
        $('html, body').animate({
            scrollTop: $('body').height()
        }, 'slow');

        setupUserlist();
    });
});

// Correct positioning of the userlist
function setupUserlist() {
    var chatturUserlist = $('.chattur__userlist');

    // if 'mobile' -> width < 768px
    // else bigger screens
    if (window.matchMedia('(max-width:767px)').matches) {
        chatturUserlist
            .css('width', '25%')
            .css('right', '0');
        $('.row.content')
            .css('min-height', chatturUserlist.height() + 45 + 'px');
    } else {
        var settingsItem = $('.chattur__settings');
        var userListWidth = settingsItem.width() + parseFloat(settingsItem.css('marginRight').replace('px', ''));
        var userListRight = parseFloat($('.container').css('marginRight').replace('px', '')) + 30;

        chatturUserlist
            .css('width', userListWidth + 'px')
            .css('right', userListRight + 'px');
    }

}