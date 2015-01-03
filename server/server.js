var io = require('socket.io')(3231);
var user_count = 0;
io.on('connection', function(socket){
    //console.log('user connected');
    user_count++;
    if(user_count > 2) {
        socket.broadcast.emit('init', {result: false});
        return;
    }
    socket.emit('init',{result: true, user_side: user_count == 1 ? 'w' : 'b'});
    io.emit('start',{result: true});
    socket.on('move', function(msg){
        //to(room_id)
        socket.broadcast.emit('move', msg);
        console.log('test: ' + msg.newX + ':' + msg.newY);
    });
});