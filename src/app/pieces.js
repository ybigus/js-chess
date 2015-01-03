"use strict"; 
var pieces = function(){
	return {
		getAvailableMoves: function(x, y, is_king_safe){
			var available_moves = [];
			switch(board[x][y].piece){
				case 'pawn':
					available_moves = this.getAvailableMovesForPawn(x, y);
					break;
				case 'knight':
					available_moves = this.getAvailableMovesForKnight(x, y);
					break;
				case 'rook':
					available_moves = this.getAvailableMovesForRook(x, y);
					break;
				case 'bishop':
					available_moves = this.getAvailableMovesForBishop(x, y);
					break;
				case 'queen':
					available_moves = this.getAvailableMovesForQueen(x, y);
					break;
				case 'king':
					available_moves = this.getAvailableMovesForKing(x, y, is_king_safe);
					break;
			}
			return available_moves;
		},
		//fight_off - pawns can't fight same as move
		cell_available: function(x, y, newX, newY, fight_off){
			if(newX > 7 || newX < 0 || newY > 7 || newY < 0)
				return false;
			if(board[newX][newY] == null || (!fight_off && board[newX][newY].color != board[x][y].color))
				return true;
			return false;
		},
		getAvailableMovesForPawn: function(x, y){
			var availableMoves = [];
			if(board[x][y].color == 'w'){
				if(this.cell_available(x,y,x+1,y,true)) availableMoves.push({x:x+1, y:y});
				if(x == 1 && this.cell_available(x,y,x+1,y,true) && this.cell_available(x,y,x+2,y,true)) availableMoves.push({x:x+2, y:y});
				if((passant_capture_b != null && passant_capture_b.x == x+1 && passant_capture_b.y == y+1) || (this.cell_available(x,y,x+1,y+1) && board[x+1][y+1] != null)) availableMoves.push({x:x+1, y:y+1});
				if((passant_capture_b != null && passant_capture_b.x == x+1 && passant_capture_b.y == y-1) || (this.cell_available(x,y,x+1,y-1) && board[x+1][y-1] != null)) availableMoves.push({x:x+1, y:y-1});
			}
			else{
				if(this.cell_available(x,y,x-1,y,true)) availableMoves.push({x:x-1, y:y});
				if(x == 6 && this.cell_available(x,y,x-1,y,true) && this.cell_available(x,y,x-2,y,true)) availableMoves.push({x:x-2, y:y});
				if((passant_capture_w != null && passant_capture_w.x == x-1 && passant_capture_w.y == y+1) || (this.cell_available(x,y,x-1,y+1) && board[x-1][y+1] != null)) availableMoves.push({x:x-1, y:y+1});
				if((passant_capture_w != null && passant_capture_w.x == x-1 && passant_capture_w.y == y-1) || (this.cell_available(x,y,x-1,y-1) && board[x-1][y-1] != null)) availableMoves.push({x:x-1, y:y-1});
			}			
			return availableMoves;
		},
		getAvailableMovesForKnight: function(x, y){
			var availableMoves = [];
			if(this.cell_available(x,y,x+2,y+1)) availableMoves.push({x:x+2, y:y+1});
			if(this.cell_available(x,y,x+2,y-1)) availableMoves.push({x:x+2, y:y-1});
			if(this.cell_available(x,y,x-2,y+1)) availableMoves.push({x:x-2, y:y+1});
			if(this.cell_available(x,y,x-2,y-1)) availableMoves.push({x:x-2, y:y-1});

			if(this.cell_available(x,y,x+1,y+2)) availableMoves.push({x:x+1, y:y+2});
			if(this.cell_available(x,y,x-1,y+2)) availableMoves.push({x:x-1, y:y+2});
			if(this.cell_available(x,y,x+1,y-2)) availableMoves.push({x:x+1, y:y-2});
			if(this.cell_available(x,y,x-1,y-2)) availableMoves.push({x:x-1, y:y-2});
			return availableMoves;
		},
		getAvailableMovesForRook: function(x, y){
			var availableMoves = [];
			var newX = x;
			while(this.cell_available(x,y,++newX,y)){
				availableMoves.push({x:newX, y:y});
				if(board[newX][y] != null) break;
			}
			newX = x;
			while(this.cell_available(x,y,--newX,y)){
				availableMoves.push({x:newX, y:y});
				if(board[newX][y] != null) break;
			}

			var newY = y;
			while(this.cell_available(x,y,x,++newY)){
				availableMoves.push({x:x, y:newY});
				if(board[x][newY] != null) break;
			}
			newY = y;
			while(this.cell_available(x,y,x,--newY)){
				availableMoves.push({x:x, y:newY});
				if(board[x][newY] != null) break;
			}
			return availableMoves;
		},
		getAvailableMovesForBishop: function(x, y){
			var availableMoves = [];
			var newX = x, newY = y;			
			while(this.cell_available(x,y,++newX,++newY)){
				availableMoves.push({x:newX, y:newY});
				if(board[newX][newY] != null) break;
			}
			newX = x, newY = y;
			while(this.cell_available(x,y,--newX,--newY)){
				availableMoves.push({x:newX, y:newY});
				if(board[newX][newY] != null) break;
			}
			newX = x, newY = y;
			while(this.cell_available(x,y,++newX,--newY)){
				availableMoves.push({x:newX, y:newY});
				if(board[newX][newY] != null) break;
			}
			newX = x, newY = y;
			while(this.cell_available(x,y,--newX,++newY)){
				availableMoves.push({x:newX, y:newY});
				if(board[newX][newY] != null) break;
			}
			return availableMoves;
		},
		getAvailableMovesForQueen: function(x, y){
			var rookMoves = this.getAvailableMovesForRook(x,y);
			var bishopMoves = this.getAvailableMovesForBishop(x,y);
			return _.union(rookMoves, bishopMoves);
		},
		getAvailableMovesForKing: function(x, y, is_king_safe){
			var availableMoves = [];
			if(this.cell_available(x,y,x+1,y)) availableMoves.push({x:x+1, y:y});
			if(this.cell_available(x,y,x+1,y+1)) availableMoves.push({x:x+1, y:y+1});
			if(this.cell_available(x,y,x+1,y-1)) availableMoves.push({x:x+1, y:y-1});

			if(this.cell_available(x,y,x-1,y)) availableMoves.push({x:x-1, y:y});
			if(this.cell_available(x,y,x-1,y+1)) availableMoves.push({x:x-1, y:y+1});
			if(this.cell_available(x,y,x-1,y-1)) availableMoves.push({x:x-1, y:y-1});

			if(this.cell_available(x,y,x,y+1)) availableMoves.push({x:x, y:y+1});
			if(this.cell_available(x,y,x,y-1)) availableMoves.push({x:x, y:y-1});
			//castling
			if(!board[x][y].moved && is_king_safe){
				//short
				if(
					board[x][y+1] == null && board[x][y+2] == null && 
					board[x][y+3] != null && board[x][y+3].piece == 'rook' && !board[x][y+3].moved
					){
					availableMoves.push({x:x, y:y+2,castling: true});
				}
				//long
				if(
					board[x][y-1] == null && board[x][y-2] == null && board[x][y-3] == null && 
					board[x][y-4] != null && board[x][y-4].piece == 'rook' && !board[x][y-4].moved
					){
					availableMoves.push({x:x, y:y-2,long_castling: true});
				}
			}
			return availableMoves;
		}		
	}
}