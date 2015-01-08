var socket;
var server_address = 'http://107.170.144.186:3231';
var network=function(){
    return {
        init: function(room_id){
            socket = io(server_address, { query: 'id=' + room_id });
            socket.on('init', function(msg){
                if(msg.result){
                    user_side = msg.user_side;
                    if(user_side == 'b'){
                        angle = 180;
                        camera.position.x = -camera_position.x + cell_size * 8 * Math.cos(Math.PI * angle / 180);
                        camera.position.z = -camera_position.x + cell_size * 8 * Math.sin(Math.PI * angle / 180);
                    }
                }
                else{
                    showMessage(messages.ROOM_BUSY);
                }
            });
            socket.on('start', function(msg){
                showMessage(messages.EMPTY);
                opponent_ready = true;
            });
            socket.on('move', function(msg){
                world().move(msg.x, msg.y, msg.newX, msg.newY);
            });
        },
        move: function(x,y, newX, newY){
            if(!game_finished){
                showMessage(messages.OPPONENTS_TURN);
            }
            socket.emit('move', {x:x, y:y, newX:newX, newY:newY});
        }
    }
}