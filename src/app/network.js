var network=function(){
    return {
        init: function(){
            var socket = io('http://127.0.0.1:3231');
            socket.on('init', function(msg){
                user_side = msg.user_side;
                your_turn = user_side == 'w';
            });
            socket.on('move', function(msg){
                console.log(msg);
                your_turn = true;
            });
        },
        move: function(x,y, newX, newY){
            your_turn = false;
            socket.emit('move', {x:x, y:y, newX:newX, newY:newY});
        }
    }
}