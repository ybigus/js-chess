/* Returns: 
	result: is available (true|false)
	message: error message (string)
	alert: show message or not (true|false)
	game_finished: true|false
	check: is mate or stalemate (true|false)
	kill: is enemy piece killed {x,y}
	transform: is pawn becomes queen {x,y}
	castling: rook jump {x,y}
*/
"use strict";
var game=function(){
	return {
		move: function(x, y, newX, newY){
			if(!board[x][y]) return {result:false};
			if(current != board[x][y].color){
				return {message: messages.NOT_YOUR_TURN, result: false, alert: true};
			}
			var is_king_safe = this.isKingSafe();
			var kill = null;
			var castling = false;
			var transform = false;
			
			var available_moves = pieces().getAvailableMoves(x, y, is_king_safe);
			var is_available = _.find(available_moves, function(cell){
				return cell.x == newX && cell.y == newY;
			});
			if(is_available){
				var from_cell = board[x][y];
				var to_cell = board[newX][newY];
				board[newX][newY] = board[x][y];
				board[x][y] = null;
				if(!this.isKingSafe()){
					board[newX][newY] = to_cell;
					board[x][y] = from_cell;
					return {message: messages.KING_IS_NOT_SAFE, result: false, alert: true};
				}
				//fight
				if(to_cell != null){					
					kill = {x: newX, y: newY};
				}
				//passant capture
				if(current == 'w' && passant_capture_b != null && passant_capture_b.x == newX && passant_capture_b.y == newY){
					board[newX - 1][newY] = null;
					kill = {x: newX - 1, y: newY};
				}
				if(current == 'b' && passant_capture_w != null && passant_capture_w.x == newX && passant_capture_w.y == newY){
					board[newX + 1][newY] = null;
					kill = {x: newX + 1, y: newY};
				}
				//mark passant capture
				if(board[newX][newY].piece == 'pawn' && Math.abs(x - newX) == 2){
					if(current == 'w'){
						passant_capture_w = {x:newX - 1, y:newY};
					}
					else{
						passant_capture_b = {x:newX + 1, y:newY};
					}
				}
				else{
					if(current == 'w'){
						passant_capture_w = null;
					}
					else{
						passant_capture_b = null;
					}
				}
				//castling
				if(board[newX][newY].piece == 'king'){
					if(is_available.long_castling){
						board[newX][newY + 1] = board[newX][0];
						board[newX][0] = null;
						castling = {x: newX, y: 0, newX: newX, newY: newY + 1};
					}
					if(is_available.castling){
						board[newX][newY - 1] = board[newX][7];
						board[newX][7] = null;
						castling = {x: newX, y: 7, newX: newX, newY: newY - 1};
					}
				}
				if(board[newX][newY].piece == 'king' || board[newX][newY].piece == 'rook'){
					board[newX][newY].moved = true;
				}				
				//at base pawn become queen(TODO: user could choose another than queen piece)
				if(board[newX][newY].piece == 'pawn' && 
					(
						(board[newX][newY].color == 'w' && newX == 7) || 
						(board[newX][newY].color == 'b' && newX == 0)
					)) {
						board[newX][newY].piece = 'queen';
						transform = {x: newX, y: newY};						
				}
				//finish turn				
				current = current == 'w' ? 'b' : 'w';				
				//check for mate and stalemate
				if(!this.checkForMate()){
					return {result: true, game_finished: true, check: !this.isKingSafe(), kill: kill, transform: transform, castling:castling};
				}
				return {result: true, kill: kill, transform: transform, castling:castling, check: !this.isKingSafe()};
			}
			else{
				return {result: false, alert: false};
			}
		},
		checkForMate: function(){
            var is_king_save = this.isKingSafe();
			for(var x=0; x<board.length; x++){
				for(var y=0; y<board[x].length; y++){
					if(board[x][y] != null && board[x][y].color == current){
						var available_moves = pieces().getAvailableMoves(x,y, is_king_save);
                        
                        for(var i=0; i<available_moves.length; i++){
                            var from_cell = board[x][y];
                            var to_cell = board[available_moves[i].x][available_moves[i].y];
                            board[available_moves[i].x][available_moves[i].y] = board[x][y];
                            board[x][y] = null;
                            if(this.isKingSafe()){
                                board[available_moves[i].x][available_moves[i].y] = to_cell;
                                board[x][y] = from_cell;
                                return true;
                            }
                            board[available_moves[i].x][available_moves[i].y] = to_cell;
                            board[x][y] = from_cell;
                        }
					}
				}
			}
			return false;
		},
		isKingSafe: function(){
			var opponent = current == 'w' ? 'b' : 'w';									
			for(var x=0; x<board.length; x++){
				for(var y=0; y<board[x].length; y++){
					if(board[x][y] != null && board[x][y].color == opponent){
						var moves = pieces().getAvailableMoves(x,y);
						var does_king_under_atack = _.find(moves,function(cell){
							return board[cell.x][cell.y] != null && board[cell.x][cell.y].piece == 'king' && board[cell.x][cell.y].color == current;
						});
						if(does_king_under_atack){							
							return false;
						}
					}
				}
			}
			return true;
		}
	}
};