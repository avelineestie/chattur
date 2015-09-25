/**
 * Created by Aveline on 25/09/15.
 */
module.exports = function (socket) {
    console.log('a user connected');
    //console.dir(socket);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message:send', function(deliverable){
        socket.broadcast.emit('message:deliver', deliverable);
    });

};