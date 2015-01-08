var messages = {
	NOT_YOUR_TURN: "Not your turn",
	KING_IS_NOT_SAFE: "King isn't safe",
	NOT_YOUR_PIECE: "Not your piece",

    ROOM_BUSY: "Room is busy...",
    EMPTY: "",
    OPPONENTS_TURN: "Opponent's turn...",

    INITIALIZING: "Initializing...",
    WAITING_OPPONENT: "Waiting for opponent...",

    CHECK: "Check!",
    MATE: "Check and mate!",
    STALEMATE: "Stalemate",

    YOU_WIN: "Opponent disconnected. You win"
}

function showMessage(msg){
    $('.alerts').text(msg);
}