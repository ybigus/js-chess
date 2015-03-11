var socket;
var server_address = 'http://107.170.144.186:3231';
//var server_address = 'http://127.0.0.1:3231';
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
                if(user_side == 'w'){
                    showMessage(messages.EMPTY);
                }
                opponent_ready = true;
                $('.draw').show();
            });
            socket.on('move', function(msg){
                world().move(msg.x, msg.y, msg.newX, msg.newY);
            });
            socket.on('draw_offer', function(msg){
                if(confirm(messages.DRAW_OFFER)){
                    showMessage(messages.DRAW);
                    game_finished = true;
                    socket.emit('draw');
                }
            });
            socket.on('draw', function(msg){
                showMessage(messages.DRAW);
                game_finished = true;
            });
            socket.on('game_finished', function(msg){
                if(msg.result){
                    game_finished = true;
                    showMessage(messages.YOU_WIN);
                    socket.disconnect();
                }
            });
        },
        move: function(x,y, newX, newY){
            if(!game_finished){
                showMessage(messages.OPPONENTS_TURN);
            }
            socket.emit('move', {x:x, y:y, newX:newX, newY:newY});
        },
        offer_draw: function(){
            socket.emit('draw_offer');
        }
    }
}();