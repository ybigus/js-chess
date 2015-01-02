var io = require('socket.io')(3231);

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('move', function(msg){
      //to(room_id)
      socket.broadcast.emit('move', msg);
    console.log('test: ' + msg.newX + ':' + msg.newY);
  });
});