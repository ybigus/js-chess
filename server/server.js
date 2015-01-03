//BUGS:
/*
* after reload board is initial, both black
* on multiplayer allow select only current items
* */
var io = require('socket.io')(3231);
var user_count = 0;
io.on('connection', function(socket){
    var room_id = socket.handshake.query.id;
    if(io.sockets.adapter.rooms && io.sockets.adapter.rooms[room_id]){
        var room = io.sockets.adapter.rooms[room_id];
        user_count = Object.keys(room).length;
    }
    else{
        user_count = 0;
    }
    if(user_count >= 2) {
        socket.broadcast.emit('init', {result: false});
        return;
    }

    socket.emit('init',{result: true, user_side: user_count == 0 ? 'w' : 'b'});
    socket.join(room_id);
    if(user_count == 1){
        io.in(room_id).emit('start',{result: true});
    }
    socket.on('move', function(msg){
        socket.broadcast.to(room_id).emit('move', msg);
    });
});