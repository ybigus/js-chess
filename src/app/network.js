var network=function(){
    return {
        init: function(){
            var socket = io('http://127.0.0.1:3231');
            socket.emit('move', {x:1,y:3,newX:3,newY:3});
            socket.on('init', function(msg){
                user_side = msg.user_side;
            });
            socket.on('move', function(msg){
                console.log(msg);
            });
        }
    }
}