var socket;
var network=function(){
    return {
        init: function(room_id){
            socket = io('http://127.0.0.1:3231', { query: 'id=' + room_id });
            socket.on('init', function(msg){
                user_side = msg.user_side;
                if(is_multiplayer && user_side == 'b'){
                    angle = 180;
                    camera.position.x = -200 + 400 * Math.cos(Math.PI * angle / 180);
                    camera.position.z = -200 + 400 * Math.sin(Math.PI * angle / 180);
                }
            });
            socket.on('start', function(msg){
                $('.alerts').text('');
                opponent_ready = true;
            });
            socket.on('move', function(msg){
                world().move(msg.x, msg.y, msg.newX, msg.newY);
            });
        },
        move: function(x,y, newX, newY){
            if(!game_finished){
                $('.alerts').text('Opponent Turn...');
            }
            socket.emit('move', {x:x, y:y, newX:newX, newY:newY});
        }
    }
}