/*globals*/
var current;
var passant_capture_w = null, passant_capture_b = null;
var board;

var world=function(){
	return {
		startGame: function(){
			board = [
						[
							{piece:'rook',color:'w'},{piece:'knight',color:'w'},{piece:'bishop',color:'w'},
							{piece:'queen',color:'w'},{piece:'king',color:'w'},
							{piece:'bishop',color:'w'},{piece:'knight',color:'w'},{piece:'rook',color:'w'}
						],
						[
							{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},
							{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'},{piece:'pawn',color:'w'}
						],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[null,null,null,null,null,null,null,null],
						[
							{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},
							{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'},{piece:'pawn',color:'b'}
						],
						[
							{piece:'rook',color:'b'},{piece:'knight',color:'b'},{piece:'bishop',color:'b'},
							{piece:'queen',color:'b'},{piece:'king',color:'b'},
							{piece:'bishop',color:'b'},{piece:'knight',color:'b'},{piece:'rook',color:'b'}
						]
					];
					passant_capture_w = null;
					passant_capture_b = null;
					current = 'w';
		},
		killPieceAt: function(x,y){			
		},
		tranformPawnIntoQueen: function(x,y){			
		}
	}
}

describe('Chess', function(){
  describe('mate in 3 steps', function(){
    it('white shoud win', function(){   
    	world().startGame();	    
	    assert(game().move(0,3,3,3).result==false,'Queen moved at first turn');
	    assert(game().move(1,4,3,4).result,'Pawn not moved at first turn');
	    assert(board[1][4]==null,'Pawn copied');
	    assert(board[3][4].piece=='pawn','Pawn now moved');
	    assert(passant_capture_w!=null,'Pawn not marked as passant');
	    assert(current=='b',"Didn't change side");
	    
	    assert(game().move(6,4,4,4).result,'Black did not answered');	    
		assert(game().move(0,3,2,5).result,'White queen not moved');
		assert(game().move(7,1,5,2).result,'Black knight dud not jump');
		assert(game().move(0,5,3,2).result,'White bishop did not move');
		assert(game().move(6,1,5,1).result,'Black pawn did not moved');

		var last_move = game().move(2,5,6,5);				
		assert(last_move.result && last_move.game_finished && !last_move.draw,'Not finished!');
    });
  });
});